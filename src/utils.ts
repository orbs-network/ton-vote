import { BASE_ERROR_MESSAGE, LOCAL_STORAGE_PROVIDER } from "config";
import _ from "lodash";
import moment from "moment";
import { fromNano, Wallet } from "ton";
import { RawVote, RawVotes, Vote, VotingPower } from "types";
export const makeElipsisAddress = (address: string, padding = 6): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(
    address.length - padding
  )}`;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));


export async function waitForSeqno(wallet: Wallet) {
  const seqnoBefore = await wallet.getSeqNo();

  return async () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      await delay(3000);
      let seqnoAfter;

      try {
        seqnoAfter = await wallet.getSeqNo();
      } catch (error) {}

      if (seqnoAfter && seqnoAfter > seqnoBefore) return;
    }
    throw new Error(BASE_ERROR_MESSAGE);
  };
}

export const getAdapterName = () => {
  return localStorage.getItem(LOCAL_STORAGE_PROVIDER);
};

export const Logger = (log: any) => {
  //TODO clean
  // if (import.meta.env.DEV) {
  //   console.log(log);
  // }
    console.log(log);
};

export const parseVotes = (rawVotes: RawVotes, votingPower: VotingPower) => {
  let votes: Vote[] = _.map(rawVotes, (v: RawVote, key: string) => {
    const _votingPower = votingPower[key];
    return {
      address: key,
      vote: v.vote,
      votingPower: _votingPower ? fromNano(_votingPower) : "0",
      timestamp: v.timestamp,
    };
  });

  const sortedVotes = _.orderBy(votes, "timestamp", ["desc", "asc"]);
  return sortedVotes;
};

