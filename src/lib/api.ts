import { createProposals } from "mock";
import axios from "axios";
import _ from "lodash";
import {
  DaoMetadata,
  DaoProposal,
  DaoRoles,
  GetDaoProposals,
  GetDaos,
  ProposalResults,
  ProposalState,
  RawVotes,
  VotingPower,
} from "types";
import { Logger, parseVotes } from "utils";
import * as mock from "mock";
import moment from "moment";
import { LAST_FETCH_UPDATE_LIMIT } from "config";
import { useAppPersistedStore } from "store";
import { ProposalMetadata } from "ton-vote-npm";

const axiosInstance = axios.create({
  baseURL: "https://dao-vote-cache-server.herokuapp.com",
});

const getDaoRoles = async (daoAddress: string): Promise<DaoRoles> => {
  Logger("getDapRoles from contract");

  return {} as DaoRoles;
};

const getDaos = async (): Promise<GetDaos> => {
  Logger("getDaos from server");
  return [] as any;
};

const getDaoMetadata = async (daoAddress: string): Promise<DaoMetadata> => {
  Logger("getDAO from server");

  return mock.createDaoMetadata(daoAddress);
};

const getDaoProposals = async (
  daoAddress: string
): Promise<GetDaoProposals> => {
  Logger("getDaoProposals from server");

  return mock.getProposals();
};
const getDaoProposalInfo = async (
  contractAddress: string
): Promise<ProposalMetadata> => {
  return (await axiosInstance.get("/info")).data;
};

const getDapProposalMetadata = (
  proposalAddress: string,
) => {
  return mock.getProposalMetadata(proposalAddress);
};

const getState = async (
  proposalAddress: string,
  latestMaxLtAfterTx?: string
): Promise<ProposalState | null> => {
  const _getState = async () => {
    const state: GetStateApiPayload = (await axiosInstance.get("/state")).data;
    return {
      ...state,
      votes: parseVotes(state.votes, state.votingPower),
      results: state.proposalResults,
    };
  };

  const isServerLastUpdateValid = await validateServerLastUpdate();
  if (!isServerLastUpdateValid) {
    Logger(`server last update time invalid, fetching from contract`);
    return null;
  }

  if (!latestMaxLtAfterTx) {
     Logger(`fetching from server`);
    return _getState();
  }
  const serverMaxLt = await getMaxLt();

  if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
    Logger(`server is outdated, fetching from contract`);
    return null;
  }

  Logger(`fetching from server`);

  return _getState();
};

const getMaxLt = async (): Promise<string> => {
  return (await axiosInstance.get("/maxLt")).data;
};

const getStateUpdateTime = async (): Promise<number> => {
  return (await axiosInstance.get("/stateUpdateTime")).data;
};

const validateServerLastUpdate = async (): Promise<boolean> => {
  const serverLastUpdate = (await axiosInstance.get("/fetchUpdateTime")).data;
  return moment().valueOf() - serverLastUpdate < LAST_FETCH_UPDATE_LIMIT;
};

export const server = {
  getDaos,
  getDaoMetadata,
  getDaoProposals,
  getDaoProposalInfo,
  getState,
  getMaxLt,
  validateServerLastUpdate,
  getStateUpdateTime,
  getDaoRoles,
  getDapProposalMetadata,
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  proposalResults: ProposalResults;
  maxLt: string;
}
