import { useQuery } from "@tanstack/react-query";
import { VOTE_OPTIONS } from "config";
import {
  getAllVotes,
  getCurrentResults,
  getVotingPower,
} from "contracts-api/logic";
import moment from "moment";
import { useDataFromQueryClient, useProposalInfoQuery } from "queries";
import { useMemo } from "react";
import {
  useClientStore,
  useConnectionStore,
  usePersistedStore,
  useServerStore,
  useVoteStore,
} from "store";
import { ProposalInfo, RawVotes, Transaction, Vote, VotingPower } from "types";
import { parseVotes } from "utils";

export const useWalletVote = () => {
  // const { setVote } = useVoteStore();

  return (
    votes: Vote[],
    walletAddress = useConnectionStore.getState().address
  ) => {
    if (!walletAddress) return votes;
    let vote = votes.find((it) => it.address === walletAddress);

    if (!vote) return votes;
    const index = votes.findIndex((it) => it.address === walletAddress);
    votes.splice(index, 1);
    votes.unshift(vote);

    // const value = VOTE_OPTIONS.find((it) => it === vote);
    // setVote(value || "");

    return votes;
  };
};

const numToMillis = (value: Number) => {
  return moment.unix(Number(value)).utc().valueOf();
};

export const useVoteTimeline = () => {
  const {data: info, isLoading} = useProposalInfoQuery();

  const query = useQuery(
    ["useVoteTimeline"],
    () => {
      if (!info) return null;
      const startTime = info.startTime;
      const endTime = info.endTime;
      const now = moment.utc().valueOf();
      const voteStarted = numToMillis(startTime) <= now;
      const voteEnded = numToMillis(endTime) <= now;
      return {
        voteStarted,
        voteEnded,
        voteInProgress: voteStarted && !voteEnded,
        isLoading,
      };
    },
    {
      enabled: !!info,
      refetchInterval: 1_000,
    }
  );

  return (
    query.data || {
      voteStarted: false,
      voteEnded: false,
      voteInProgress: false,
      isLoading,
    }
  );
};

export const useGetContractState = () => {
  const { clientV4 } = useClientStore();
  return async (
    proposalInfo: ProposalInfo,
    transactions: Transaction[],
    prevVotingPower?: VotingPower
  ) => {
    const votingPower = await getVotingPower(
      clientV4,
      proposalInfo,
      transactions,
      prevVotingPower || {}
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
};
