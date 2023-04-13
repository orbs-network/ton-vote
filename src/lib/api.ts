import axios from "axios";
import _ from "lodash";
import {
  Dao,
  DaoMetadata,
  Proposal,
  ProposalResults,
  ProposalState,
  RawVotes,
  VotingPower,
} from "types";
import { Logger, parseVotes } from "utils";
import moment from "moment";
import { LAST_FETCH_UPDATE_LIMIT } from "config";
import { ProposalMetadata } from "ton-vote-sdk";
import * as TonVoteSDK from "ton-vote-sdk";
const baseURL = "https://ton-vote-cache-server.herokuapp.com";

const axiosInstance = axios.create({
  baseURL,
});

const getDaos = async (
  page: number = 0,
  signal?: AbortSignal
): Promise<{ nextId: number; daos: Dao[] }> => {
  return (await axiosInstance.get(`/daos/${page}`, { signal })).data;
};

const getProposals = async (
  daoAddress: string,
  page: number = 0,
  signal?: AbortSignal
): Promise<{ nextId: number; proposals: Proposal[] }> => {
  return (
    await axiosInstance.get(`/proposals/${daoAddress}/${page}`, { signal })
  ).data;
};
const getProposalMetadata = async (
  daoAddress: string,
  proposalAddress: string,
  signal?: AbortSignal
): Promise<ProposalMetadata> => {
  return (
    await axiosInstance.get(`/proposal/${daoAddress}/${proposalAddress}`, {
      signal,
    })
  ).data.metadata;
};

const getState = async (
  proposalAddress: string,
  signal?: AbortSignal,
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

  const isServerLastUpdateValid = await validateServerLastUpdate(signal);
  if (!isServerLastUpdateValid) {
    Logger(`server last update time invalid, fetching from contract`);
    return null;
  }

  if (!latestMaxLtAfterTx) {
    Logger(`fetching from server`);
    return _getState();
  }
  const serverMaxLt = await getMaxLt(signal);

  if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
    Logger(`server is outdated, fetching from contract`);
    return null;
  }

  Logger(`fetching from server`);

  return _getState();
};

const getMaxLt = async (signal?: AbortSignal): Promise<string> => {
  return (await axiosInstance.get("/maxLt", { signal })).data;
};

const getDao = async (
  daoAddress: string,
  signal?: AbortSignal
): Promise<Dao | undefined> => {
  return (await axiosInstance.get(`/dao/${daoAddress}`, { signal })).data;
};

// const getStateUpdateTime = async (signal?: AbortSignal): Promise<number> => {
//   return (await axiosInstance.get("/stateUpdateTime")).data;
// };

const validateServerLastUpdate = async (
  signal?: AbortSignal
): Promise<boolean> => {
  const serverLastUpdate = (await axiosInstance.get("/fetchUpdateTime")).data;
  return moment().valueOf() - serverLastUpdate < LAST_FETCH_UPDATE_LIMIT;
};

export const api = {
  getDaos,
  getProposals,
  getProposalMetadata,
  getState,
  getMaxLt,
  validateServerLastUpdate,
  getDao,
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  proposalResults: ProposalResults;
  maxLt: string;
}
