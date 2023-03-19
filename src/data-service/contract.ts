import { delay } from "@ton-defi.org/ton-connection";
import { useConnectionStore } from "connection";
import {
  getEndTime,
  getSnapshotTime,
  getStartTime,
} from "contracts-api/getters";
import {
  getVotingPower,
  getCurrentResults,
  getAllVotes,
  getTransactions as getTXs,
  filterTxByTimestamp,
  getProposalInfo,
} from "contracts-api/logic";
import { createDaos, createProposals } from "mock";
import { Address, TonTransaction } from "ton";
import {
  ProposalInfo,
  VotingPower,
  RawVotes,
  Dao,
  DaoProposal,
  ProposalState,
} from "types";
import { Logger, parseVotes } from "utils";

const getDAOS = async (): Promise<Dao[]> => {
  await delay(1000);
  return createDaos(50);
};

const getDAO = async (daoId: string): Promise<Dao> => {
  await delay(1000);
  return createDaos(1)[0];
};

const getDAOProposals = async (daoId: string): Promise<DaoProposal[]> => {
  await delay(1000);
  return createProposals(20);
};

const getDAOProposalInfo = async (
  contractAddress: string
): Promise<ProposalInfo> => {
  const clientV2 = useConnectionStore.getState().clientV2!;
  const clientV4 = useConnectionStore.getState().clientV4!;
  await delay(1000);
  return {
    startTime: await getStartTime(clientV2),
    endTime: await getEndTime(clientV2),
    snapshot: await getSnapshotTime(clientV2, clientV4),
  };
};

export const getState = async (
  proposalInfo: ProposalInfo,
  transactions: TonTransaction[],
  prevVotingPower: VotingPower = {}
) => {
  const clientV4 = useConnectionStore.getState().clientV4!;
  const votingPower = await getVotingPower(
    clientV4,
    proposalInfo,

    transactions,
    prevVotingPower
  );

  const proposalResults = getCurrentResults(
    transactions,
    votingPower,
    proposalInfo
  );
  const rawVotes = getAllVotes(transactions, proposalInfo) as RawVotes;
  return {
    votingPower,
    proposalResults,
    votes: parseVotes(rawVotes, votingPower),
  };
};

const getTransactions = async (contractAddress: string, toLt?: string) => {
  const client = useConnectionStore.getState().clientV2!;
  return getTXs(contractAddress, client, toLt);
};

const getStateUntilMaxLt = async (
  contractAddress: string,
  maxLt?: string,
  proposalInfo?: ProposalInfo
): Promise<ProposalState> => {
  const _transactions = (await getTransactions(contractAddress)).allTxns;
  const _proposalInfo =
    proposalInfo || (await getDAOProposalInfo(contractAddress));
  const filteredTransactions = filterTxByTimestamp(_transactions, maxLt);

  const contractState = await contractDataService.getState(
    _proposalInfo!,
    filteredTransactions
  );

  return contractState;
};


const createProposal = (title: string, description: string, discussion: string) => {
  console.log({ title, description, discussion });
}

export const contractDataService = {
  getDAOS,
  getDAO,
  getDAOProposals,
  getDAOProposalInfo,
  getState,
  getTransactions,
  getStateUntilMaxLt,
  createProposal,
};
