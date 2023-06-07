import _ from "lodash";
import { TonClient, TonClient4, Transaction } from "ton";
import * as TonVoteSDK from "ton-vote-contracts-sdk";
import {
  getClientV2,
  getProposalMetadata,
  getTransactions,
  ProposalMetadata,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { Dao, Proposal } from "types";
import { getVoteStrategyType, Logger, parseVotes } from "utils";
import { api } from "api";
import retry from "async-retry";

const getProposalFromContract = async (
  clientV2: TonClient,
  clientV4: TonClient4,
  proposalAddress: string,
  _metadata?: ProposalMetadata,
  _transactions?: Transaction[]
): Promise<Proposal | null> => {
  const metadata =
    _metadata ||
    (await getProposalMetadata(clientV2, clientV4, proposalAddress));
  let transactions: Transaction[];
  let maxLt: undefined | string = "";

  if (!_transactions || _.isEmpty(_transactions)) {
    const result = await getTransactions(clientV2, proposalAddress);

    maxLt = result.maxLt;
    transactions = result.allTxns;
  } else {
    transactions = _transactions;
  }

  const { votingPowerStrategies } = metadata;

  const nftItemsHolders = await getAllNftHolders(
    proposalAddress,
    clientV4,
    metadata
  );

  const votingPower = await TonVoteSDK.getVotingPower(
    clientV4,
    metadata,
    transactions,
    {},
    getVoteStrategyType(votingPowerStrategies),
    nftItemsHolders
  );

  const proposalResult = TonVoteSDK.getCurrentResults(
    transactions,
    votingPower,
    metadata
  );
  const votes = TonVoteSDK.getAllVotes(transactions, metadata);

  return {
    votingPower,
    proposalResult: proposalResult as any,
    votes: parseVotes(votes, votingPower),
    metadata,
    maxLt,
    rawVotes: votes,
  };
};

const getDaos = async (signal?: AbortSignal) => {
  try {
    Logger("Fetching daos from api");
    const apiResult = await api.getDaos(signal);

    if (!_.isArray(apiResult)) {
      return [];
    }
    return apiResult;
  } catch (error) {}
};

export const getDaoFromContract = async (
  daoAddress: string,
  clientV2?: TonClient
) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Fetching dao from contract, address ${daoAddress}, attempt: ${attempt}`
    );
    const client = clientV2 || (await getClientV2());

    const daoState = await TonVoteSDK.getDaoState(client, daoAddress);

    const metadataArgs = await TonVoteSDK.getDaoMetadata(
      client,
      daoState.metadata
    );

    const daoFromContract: Dao = {
      daoAddress: daoAddress,
      daoRoles: {
        owner: daoState.owner,
        proposalOwner: daoState.proposalOwner,
      },
      daoMetadata: {
        metadataAddress: "",
        metadataArgs,
      },
      daoId: daoState.daoIndex,
      daoProposals:
        (await TonVoteSDK.getDaoProposals(client, daoAddress))
          .proposalAddresses || [],
    };
    return daoFromContract;
  };

  return retry(promise, { retries: 2 });
};

const getDao = async (
  daoAddress: string,
  fetchFromContract: boolean,
  signal?: AbortSignal
): Promise<Dao | undefined> => {
  // return Dao from api if exist
  if (fetchFromContract) {
    return getDaoFromContract(daoAddress);
  }

  const dao = await api.getDao(daoAddress, signal);

  if (dao) {
    return dao;
  } else {
    return getDaoFromContract(daoAddress);
  }
};

const getAllNftHolders = async (
  proposalAddress: string,
  clientV4: TonClient4,
  metadata: ProposalMetadata,
  signal?: AbortSignal
) => {
  if (
    getVoteStrategyType(metadata.votingPowerStrategies) !=
    VotingPowerStrategyType.NftCcollection
  ) {
    return {} as { [key: string]: number };
  }
  try {
    const res = await api.getAllNftHolders(proposalAddress, signal);

    if (!res) {
      throw new Error("nft holders not found");
    }
    return res;
  } catch (error) {
    return TonVoteSDK.getAllNftHolders(clientV4, metadata);
  }
};

export const lib = {
  getAllNftHolders,
  getProposalFromContract,
  getDaos,
  getDao,
};
