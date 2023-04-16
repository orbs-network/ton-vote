import axios from "axios";
import _ from "lodash";
import {
  Dao,
  Proposal,
  ProposalResults,
  RawVotes,
  VotingPower,
} from "types";
import { Logger, parseVotes } from "utils";
import moment from "moment";
import { LAST_FETCH_UPDATE_LIMIT } from "config";
const baseURL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL,
});

const getDaos = async (signal?: AbortSignal): Promise<Dao[]> => {
  return (await axiosInstance.get(`/daos/0`, { signal })).data.daos;
};

const getProposal = async (
  proposalAddress: string,
  signal?: AbortSignal
): Promise<Proposal> => {
     Logger(`Fetching proposal from api ${proposalAddress}`);
  const result = await (
    await axiosInstance.get(`/proposal/${proposalAddress}`, {
      signal,
    })
  ).data;
  return {
    ...result,
    votes: parseVotes(result.votes, result.votingPower),
  };
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
  const serverLastUpdate = (
    await axiosInstance.get("/fetchUpdateTime", { signal })
  ).data;
  return moment().valueOf() - serverLastUpdate < LAST_FETCH_UPDATE_LIMIT;
};

export const api = {
  getDaos,
  getProposal,
  getMaxLt,
  validateServerLastUpdate,
  getDao,
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  results: ProposalResults;
  maxLt: string;
}
