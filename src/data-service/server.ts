import { delay } from "@ton-defi.org/ton-connection";
import { createDaos, createProposals } from "mock";
import axios from "axios";
import _ from "lodash";
import {
  Dao,
  DaoProposal,
  ProposalInfo,
  ProposalState,
  RawVotes,
  Results,
  StateData,
  VotingPower,
} from "types";
import { parseVotes } from "utils";

const axiosInstance = axios.create({
  baseURL: "https://dao-vote-cache-server.herokuapp.com",
});

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
  return (await axiosInstance.get("/info")).data;
};

const getState = async (): Promise<ProposalState> => {
  const state: GetStateApiPayload = (await axiosInstance.get("/state")).data;
  const votes = parseVotes(state.votes, state.votingPower);
  return {
    ...state,
    votes,
  };
};

const getMaxLt = async (): Promise<string> => {
  return (await axiosInstance.get("/maxLt")).data;
};

const getLastFetchUpdate = async (): Promise<number> => {
  return (await axiosInstance.get("/fetchUpdateTime")).data;
};

const getStateUpdateTime = async (): Promise<number> => {
  return (await axiosInstance.get("/stateUpdateTime")).data;
};



export const serverDataService = {
  getDAOS,
  getDAO,
  getDAOProposals,
  getDAOProposalInfo,
  getState,
  getMaxLt,
  getLastFetchUpdate,
  getStateUpdateTime,
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  proposalResults: Results;
  maxLt: string;
}
