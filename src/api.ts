import axios from "axios";
import _ from "lodash";
import { Dao, Proposal, ProposalResults, RawVotes, VotingPower } from "types";
import { Logger, parseVotes } from "utils";
import {IS_DEV, API_RETRIES } from "config";
import axiosRetry from "axios-retry";
import retry from "async-retry";
import {
  FOUNDATION_PROPOSALS_ADDRESSES,
  OLD_FOUNDATION_ADDRESS,
} from "data/foundation/data";

const baseURL = IS_DEV
  ? "https://dev-ton-vote-cache.herokuapp.com"
  : "https://ton-vote-cache.herokuapp.com";

const foundationBaseUrl = "https://api.ton.vote";

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

    let url = `${baseURL}/proposal/${proposalAddress}`;
    if (FOUNDATION_PROPOSALS_ADDRESSES.includes(proposalAddress)) {
      url = `${foundationBaseUrl}/proposal/${proposalAddress}`;
    }

    const [result, maxLt] = await Promise.all([
      axios.get(url, {
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
  let url = `${baseURL}/maxLt/${proposalAddress}`;

  if (FOUNDATION_PROPOSALS_ADDRESSES.includes(proposalAddress)) {
    url = `${foundationBaseUrl}/maxLt/${proposalAddress}`;
  }
  return (await axios.get(url, { signal })).data;
};

const getDao = async (
  daoAddress: string,
  signal?: AbortSignal
): Promise<Dao | undefined> => {
  const promise = async (bail: any, attempt: number) => {
    let url = `${baseURL}/dao/${daoAddress}`;

    if (daoAddress === OLD_FOUNDATION_ADDRESS) {
      url = `${foundationBaseUrl}/dao/${daoAddress}`;
    }

    Logger(
      `Fetching dao from server, address ${daoAddress}, attempt: ${attempt}`
    );
    const data = (await axios.get(url, { signal })).data;

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
};

export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  results: ProposalResults;
  maxLt: string;
}
