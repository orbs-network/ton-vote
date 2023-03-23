import { TonConnect } from "@tonconnect/sdk";
import { TX_FEE } from "config";
import { useConnectionStore } from "connection";
import {
  getVotingPower,
  getCurrentResults,
  getAllVotes,
  getTransactions as getTXs,
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
} from "contracts-api/logic";
import * as mock from "mock";
import { isMobile } from "react-device-detect";
import { useAppPersistedStore } from "store";
import {
  Address,
  Cell,
  Sender,
  SenderArguments,
  toNano,
  TonClient,
  Transaction,
} from "ton";
import {
  RawVotes,
  ProposalState,
  DaoMetadata,
  DaoRoles,
  GetDaos,
  GetDaoProposals,
} from "types";
import { Logger, parseVotes } from "utils";

import * as TonVoteSDK from "ton-vote-npm";
import { ProposalMetadata } from "ton-vote-npm";

const getDaos = async (): Promise<GetDaos> => {
  Logger("getDaos from contract");

  const tonClient = await getClientV2();
  return TonVoteSDK.getDaos(tonClient);
};
const getDaoMetadata = async (daoAddress: string): Promise<DaoMetadata> => {
  Logger("getDAO from contract");
  const tonClient = await getClientV2();

  return TonVoteSDK.getDaoMetadata(tonClient, Address.parse(daoAddress));
};
const getDaoRoles = async (daoAddress: string): Promise<DaoRoles> => {
  Logger("getDapRoles from contract");
  const tonClient = await getClientV2();

  return TonVoteSDK.getDaoRoles(tonClient, Address.parse(daoAddress));
};

const getDaoProposals = async (
  daoAddress: string
): Promise<GetDaoProposals> => {
  Logger("getDaoProposals from contract");

  const tonClient = await getClientV2();

  return TonVoteSDK.getDaoProposals(tonClient, Address.parse(daoAddress));
};

const getDaoProposalInfo = async (
  contractAddress: string
): Promise<ProposalMetadata> => {
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

  const latestMaxLtAfterTx =
    useAppPersistedStore.getState().getLatestMaxLtAfterTx(proposalAddress) ||
    "0";

  if (latestMaxLtAfterTx) {
    const { allTxns } = await getTransactions(proposalAddress);
    _transactions = filterTxByTimestamp(allTxns, latestMaxLtAfterTx);
  } else {
    const { allTxns, maxLt } = await getTransactions(
      proposalAddress,
      prevState?.maxLt
    );
    _maxLt = maxLt;
    _transactions.unshift(...allTxns);
    console.log({ _transactions });
  }

  if (_transactions.length === 0) {
    return prevState;
  }
  const votingPower = await getVotingPower(
    proposalInfo,
    _transactions,
    prevState?.votingPower
  );

  const results = getCurrentResults(_transactions, votingPower, proposalInfo);
  const rawVotes = getAllVotes(_transactions, proposalInfo) as RawVotes;
  return {
    votingPower,
    results,
    votes: parseVotes(rawVotes, votingPower),
    maxLt: _maxLt,
  };
};

const getTransactions = async (
  contractAddress: string,
  toLt?: string
): Promise<{ allTxns: Transaction[]; maxLt?: string }> => {
  return getTXs(contractAddress, toLt);
};

const createProposal = async (
  title: string,
  description: string,
  discussion: string
) => {
  // return TonVoteSDK.newProposal();
};

const createDao = async (
  about: string,
  avatar: string,
  github: string,
  hide: boolean,
  name: string,
  terms: string,
  twitter: string,
  website: string
) => {
  // return TonVoteSDK.newDao();
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
  return TonVoteSDK.newMetdata();
};

const getSender = (address: Address, client: TonClient): Sender => {
  const connectorTC = useConnectionStore.getState().connectorTC;

  return {
    address,
    async send(args: SenderArguments) {
      await connectorTC.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: args.to.toString(),
            amount: args.value.toString(),
            payload: args.body!.toString(),
            stateInit: args.init!.data?.toString(),
          },
        ],
      });
    },
  };
};

export const sendTransaction = async (
  address: string,
  message: string,
  onSuccess: () => void
) => {
  const connectorTC = useConnectionStore.getState().connectorTC;

  const cell = new Cell();
  // new CommentMessage(message).writeTo(cell);

  handleMobileLink(connectorTC);

  await connectorTC.sendTransaction({
    validUntil: Date.now() + 5 * 60 * 1000,
    messages: [
      {
        address: address,
        amount: toNano(TX_FEE).toString(),
        stateInit: undefined,
      },
    ],
  });
  onSuccess();
};

const getDapProposalMetadata = (proposalAddress: string) => {
  return mock.getProposalMetadata(proposalAddress);
};

export const contract = {
  getDaos,
  getDaoMetadata,
  getDaoProposals,
  getDaoProposalInfo,
  getState,
  getTransactions,
  createProposal,
  sendTransaction,
  getDaoRoles,
  getDapProposalMetadata,
  createMetadata,
};

const handleMobileLink = (connectorTC?: TonConnect) => {
  if (!isMobile) return;
  const Tonkeeper = connectorTC?.wallet?.device.appName;

  switch (Tonkeeper) {
    case "Tonkeeper":
      (window as any).location = "https://app.tonkeeper.com";
      break;

    default:
      break;
  }
};
