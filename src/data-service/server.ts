import { delay } from "@ton-defi.org/ton-connection";
import {  createProposals } from "mock";
import axios from "axios";
import _ from "lodash";
import {
  DaoMetadata,
  DaoProposal,
  DaoRoles,
  GetDaoProposals,
  GetDaos,
  ProposalInfo,
  ProposalState,
  RawVotes,
  Results,
  StateData,
  VotingPower,
} from "types";
import { Logger, parseVotes } from "utils";
import * as mock from 'mock'

const axiosInstance = axios.create({
  baseURL: "https://dao-vote-cache-server.herokuapp.com",
});

const getDaoRoles = async (daoAddress: string): Promise<DaoRoles> => {
  Logger("getDapRoles from contract");

  return mock.getDaoRoles(daoAddress);
};

const getDaos = async (): Promise<GetDaos> => {
  Logger("getDaos from server");
  await delay(1000);
  return mock.getDaos();
};

const getDaoMetadata = async (daoAddress: string): Promise<DaoMetadata> => {
  Logger("getDAO from server");

  await delay(1000);
  return mock.createDaoMetadata(daoAddress);
};

const getDaoProposals = async (daoAddress: string): Promise<GetDaoProposals> => {
  Logger("getDaoProposals from server");

  await delay(1000);
  return mock.getProposals(daoAddress);
};
const getDaoProposalInfo = async (
  contractAddress: string
): Promise<ProposalInfo> => {
  return (await axiosInstance.get("/info")).data;
};

const getDapProposalMetadata = (
  daoAddress: string,
  proposalAddress: string
) => {
  return mock.getProposalMetadata(daoAddress, proposalAddress);
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

export const server = {
  getDaos,
  getDaoMetadata,
  getDaoProposals,
  getDaoProposalInfo,
  getState,
  getMaxLt,
  getLastFetchUpdate,
  getStateUpdateTime,
  getDaoRoles,
  getDapProposalMetadata,
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  proposalResults: Results;
  maxLt: string;
}
