import { useQuery } from "@tanstack/react-query";
import { VOTE_OPTIONS } from "config";
import {
  getAllVotes,
  getCurrentResults,
  getVotingPower,
} from "contracts-api/logic";
import moment from "moment";
import { useProposalInfoQuery } from "queries";
import {
  useClientStore,
} from "store";
import { ProposalInfo, RawVotes, Transaction, VotingPower } from "types";
import { parseVotes } from "utils";



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
