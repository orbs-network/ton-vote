import { useConnectionStore } from "connection";
import { getClientV2, getClientV4 } from "contracts-api/logic";
import * as mock from "mock";
import { useAppPersistedStore } from "store";
import {
  Address,
  beginCell,
  Sender,
  SenderArguments,
  storeStateInit,
} from "ton";
import { RawVotes, ProposalState } from "types";
import { Logger, parseVotes } from "utils";

import * as TonVoteSDK from "ton-vote-npm";
import { MetadataArgs, ProposalMetadata } from "ton-vote-npm";

const getDaos = async () => {
  Logger("getDaos from contract");

  const tonClient = await getClientV2();
  return TonVoteSDK.getDaos(tonClient);
};
const getDaoMetadata = async (daoAddress: string) => {
  Logger("getDAO from contract");
  const tonClient = await getClientV2();

  return TonVoteSDK.getDaoMetadata(tonClient, Address.parse(daoAddress));
};
const getDaoRoles = async (daoAddress: string) => {
  Logger("getDapRoles from contract");
  const tonClient = await getClientV2();

  return TonVoteSDK.getDaoRoles(tonClient, Address.parse(daoAddress));
};

const getDaoProposals = async (daoAddress: string) => {
  Logger("getDaoProposals from contract");

  const tonClient = await getClientV2();

  return TonVoteSDK.getDaoProposals(tonClient, Address.parse(daoAddress));
};

const getDaoProposalInfo = async (contractAddress: string) => {
  const tonClient = await getClientV2();
  const tonClienV4 = await getClientV4();

  return TonVoteSDK.getProposalInfo(
    tonClient,
    tonClienV4,
    Address.parse(contractAddress)
  );
};

export const getState = async (
  proposalAddress: string,
  proposalInfo: ProposalMetadata,
  prevState: ProposalState | null
): Promise<ProposalState | null> => {
  let _transactions = prevState?.transactions || [];
  let _maxLt = prevState?.maxLt;
  const client = await getClientV2();
  const clientV4 = await getClientV4();
  const latestMaxLtAfterTx =
    useAppPersistedStore.getState().getLatestMaxLtAfterTx(proposalAddress) ||
    "0";

  if (latestMaxLtAfterTx) {
    const { allTxns } = await TonVoteSDK.getTransactions(
      client,
      Address.parse(proposalAddress)
    );
    _transactions = TonVoteSDK.filterTxByTimestamp(allTxns, latestMaxLtAfterTx);
  } else {
    const { allTxns, maxLt } = await TonVoteSDK.getTransactions(
      client,
      Address.parse(proposalAddress),
      prevState?.maxLt
    );
    _maxLt = maxLt;
    _transactions.unshift(...allTxns);
  }

  if (_transactions.length === 0) {
    return prevState;
  }
  const votingPower = await TonVoteSDK.getVotingPower(
    clientV4,
    proposalInfo,
    _transactions,
    prevState?.votingPower
  );

  const results = TonVoteSDK.getCurrentResults(
    _transactions,
    votingPower,
    proposalInfo
  );
  const rawVotes = TonVoteSDK.getAllVotes(
    _transactions,
    proposalInfo
  ) as RawVotes;
  return {
    votingPower,
    results,
    votes: parseVotes(rawVotes, votingPower),
    maxLt: _maxLt,
  };
};

const createProposal = async (daoAddr: string, args: ProposalMetadata) => {
  const sender = getSender();
  const client = await getClientV2();

  return TonVoteSDK.newProposal(sender, client, Address.parse(daoAddr), args);
};

const createDao = async (
  metadataAddress: Address,
  ownerAddress: Address,
  proposalOwner: Address
) => {
  const sender = getSender();
  const client = await getClientV2();
  return TonVoteSDK.newDao(
    sender,
    client,
    metadataAddress,
    ownerAddress,
    proposalOwner
  );
};

const createMetadata = async (
  about: string,
  avatar: string,
  github: string,
  hide: boolean,
  name: string,
  terms: string,
  twitter: string,
  website: string
) => {
  const sender = getSender();

  const client = await getClientV2();
  const args: MetadataArgs = {
    about,
    avatar,
    github,
    hide,
    name,
    terms,
    twitter,
    website,
  };
  return TonVoteSDK.newMetdata(sender, client, args);
};

const getSender = (): Sender => {
  const { connectorTC, address } = useConnectionStore.getState();
  if (!connectorTC || !address) {
    throw new Error("Not connected");
  }
  const init = (init: any) => {
    const result = init
      ? beginCell()
          .store(storeStateInit(init))
          .endCell()
          .toBoc({ idx: false })
          .toString("base64")
      : undefined;

    return result;
  };

  return {
    address: Address.parse(address!),
    async send(args: SenderArguments) {
      await connectorTC.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: args.to.toString(),
            amount: args.value.toString(),
            stateInit: init(args.init),
            payload: args.body
              ? args.body.toBoc().toString("base64")
              : undefined,
          },
        ],
      });
    },
  };
};

const getDaoProposalMetadata = (proposalAddress: string) => {
  return mock.getProposalMetadata(proposalAddress);
};

export const contract = {
  getDaos,
  getDaoMetadata,
  getDaoProposals,
  getDaoProposalInfo,
  getState,
  createProposal,
  getDaoRoles,
  getDaoProposalMetadata,
  createMetadata,
  createDao,
};

// const handleMobileLink = (connectorTC?: TonConnect) => {
//   if (!isMobile) return;
//   const Tonkeeper = connectorTC?.wallet?.device.appName;

//   switch (Tonkeeper) {
//     case "Tonkeeper":
//       (window as any).location = "https://app.tonkeeper.com";
//       break;

//     default:
//       break;
//   }
// };
