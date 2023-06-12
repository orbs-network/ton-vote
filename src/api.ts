import axios from "axios";
import _ from "lodash";
import { Dao, Proposal, ProposalResults, RawVotes, VotingPower } from "types";
import { Logger, parseVotes } from "utils";
import moment from "moment";
import { LAST_FETCH_UPDATE_LIMIT, IS_DEV, API_RETRIES } from "config";
import axiosRetry from "axios-retry";
import retry from "async-retry";

const baseURL = IS_DEV
  ? "https://dev-ton-vote-cache.herokuapp.com"
  : "https://api.ton.vote/";

const axiosInstance = axios.create({
  baseURL,
});
axiosRetry(axiosInstance, {
  retries: API_RETRIES,
  retryDelay: axiosRetry.exponentialDelay,
});

const getDaos = async (signal?: AbortSignal): Promise<Dao[]> => {
  Logger("Fetching daos from server");
  return (await axiosInstance.get(`/daos`, { signal })).data;
};

const getAllNftHolders = async (
  proposalAddress: string,
  signal?: AbortSignal
): Promise<{ [key: string]: number }> => {
  const res = await axiosInstance.get(
    `/proposalNftHolders/${proposalAddress}`,
    {
      signal,
    }
  );
  return res.data;
};

const getProposal = async (
  proposalAddress: string,
  signal?: AbortSignal
): Promise<Proposal | undefined> => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Fetching proposal from server, address: ${proposalAddress}, attempt: ${attempt}`
    );
    const [result, maxLt] = await Promise.all([
      axiosInstance.get(`/proposal/${proposalAddress}`, {
        signal,
      }),
      getMaxLt(proposalAddress, signal),
    ]);

    if (_.isEmpty(result.data?.metadata)) {
      if (attempt === API_RETRIES + 1) {
        Logger("Failed to fetch proposal from server");
        return undefined;
      }
      throw new Error("proposal not found in server");
    }

    const proposal: Proposal = {
      ...result.data,
      votes: parseVotes(result.data.votes, result.data.votingPower),
      maxLt,
      rawVotes: result.data.votes,
    };

    return proposal;
  };
  return retry(promise, { retries: API_RETRIES });
};

const getMaxLt = async (
  proposalAddress: string,
  signal?: AbortSignal
): Promise<string> => {
  return (await axiosInstance.get(`/maxLt/${proposalAddress}`, { signal }))
    .data;
};

const getDao = async (
  daoAddress: string,
  signal?: AbortSignal
): Promise<Dao | undefined> => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Fetching dao from server, address ${daoAddress}, attempt: ${attempt}`
    );
    const data = (await axiosInstance.get(`/dao/${daoAddress}`, { signal }))
      .data;

    if (_.isEmpty(data)) {
      Logger("dao not found is server");
      if (attempt === API_RETRIES + 1) {
        return undefined;
      }
      throw new Error("dao not found in server");
    }
    return data;
  };

  return retry(promise, { retries: API_RETRIES });
};

const validateServerLastUpdate = async (
  signal?: AbortSignal
): Promise<boolean> => {
  const serverLastUpdate = (await axiosInstance.get("/updateTime", { signal }))
    .data;
  return moment().valueOf() - serverLastUpdate < LAST_FETCH_UPDATE_LIMIT;
};

const getUpdateTime = async (): Promise<number> => {
  const res = await axiosInstance.get("/updateTime");
  return res.data;
};

export const api = {
  getDaos,
  getProposal,
  getMaxLt,
  validateServerLastUpdate,
  getDao,
  getAllNftHolders,
  getUpdateTime,
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  results: ProposalResults;
  maxLt: string;
}
