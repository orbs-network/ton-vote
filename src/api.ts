import axios from "axios";
import _ from "lodash";
import { Dao, Proposal, ProposalResults, RawVotes, VotingPower } from "types";
import { Logger, parseVotes } from "utils";
import { IS_DEV, API_RETRIES } from "config";
import axiosRetry from "axios-retry";
import retry from "async-retry";

const baseURL = IS_DEV ? "https://dev-api.ton.vote" : "https://api.ton.vote";

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
): Promise<{ [key: string]: string[] }> => {
  const promise = async (bail: any, attempt: number) => {
    try {
      const res = await axiosInstance.get(
        `/proposalNftHolders/${proposalAddress}`,
        {
          signal,
        }
      );

      if (_.isEmpty(res.data)) {
        throw new Error("getAllNftHolders not found in server");
      }

      return res.data;
    } catch (error) {
      if (attempt === API_RETRIES + 1) {
        Logger("Failed to fetch getAllNftHolders from server");
      }
      throw new Error(error instanceof Error ? error.message : "");
    }
  };
  return retry(promise, { retries: API_RETRIES });
};

const getProposal = async (
  proposalAddress: string,
  signal?: AbortSignal
): Promise<Proposal | undefined> => {
  const promise = async (bail: any, attempt: number) => {
    try {
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
        throw new Error("proposal not found in server");
      }

      const proposal: Proposal = {
        ...result.data,
        votes: parseVotes(result.data.votes, result.data.votingPower),
        maxLt,
        rawVotes: result.data.votes,
      };

      return proposal;
    } catch (error) {
      if (attempt === API_RETRIES + 1) {
        Logger("Failed to fetch proposal from server");
      }
      throw new Error(error instanceof Error ? error.message : "");
    }
  };
  return retry(promise, { retries: API_RETRIES });
};

const serverVersion = async () => {
  return (await axiosInstance.get("/version")).data;
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
    try {
      Logger(
        `Fetching dao from server, address ${daoAddress}, attempt: ${attempt}`
      );
      const data = (await axiosInstance.get(`/dao/${daoAddress}`, { signal }))
        .data;

      if (_.isEmpty(data)) {
        throw new Error("dao not found in server");
      }
      return data;
    } catch (error) {
      if (attempt === API_RETRIES + 1) {
        Logger("dao not found is server");
      }

      throw new Error(error instanceof Error ? error.message : "");
    }
  };

  return retry(promise, { retries: API_RETRIES });
};

const geOperatingValidatorsInfo = async (address: string) => {
  const res = await axiosInstance.get(`/operatingValidatorsInfo/${address}`);
  return res.data;
};

const getUpdateTime = async (): Promise<number> => {
  const res = await axiosInstance.get("/updateTime");
  return res.data;
};

export const api = {
  getDaos,
  getProposal,
  getMaxLt,
  getDao,
  getAllNftHolders,
  getUpdateTime,
  serverVersion,
  geOperatingValidatorsInfo,
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  results: ProposalResults;
  maxLt: string;
}
