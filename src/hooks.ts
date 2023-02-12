import { useQuery } from "@tanstack/react-query";
import { voteOptions } from "config";
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
  const { setVote } = useVoteStore();

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

    const value = voteOptions.find((it) => it.name === vote?.vote)?.value;
    setVote(value || "");

    return votes;
  };
};

export const useIsVoteEnded = () => {
  const endTime = useProposalInfoQuery().data?.endTime;
  
  const query =  useQuery(
    ["useIsVoteEnded"],
    () => {
      return (
        moment.unix(Number(endTime)).utc().valueOf() <= moment.utc().valueOf()
      );
    },
    {
      enabled: endTime != null,
      refetchInterval: 3_000,
    }
  );

  return query.data;
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
