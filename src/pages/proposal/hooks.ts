import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useConnectionStore } from "connection";
import { contract } from "data-service";
import { useProposalAddress } from "hooks";
import _ from "lodash";
import { useSendTransaction } from "logic";
import { useProposalStateQuery } from "query";
import { useMemo } from "react";
import { useAppPersistedStore } from "store";
import { ProposalState } from "types";
import { nFormatter, Logger } from "utils";

export const useProposalVotesCount = () => {
  const { proposalVotes, dataUpdatedAt } = useProposalVotes();

  return useMemo(() => {
    const grouped = _.groupBy(proposalVotes, "vote");

    return {
      yes: nFormatter(_.size(grouped.Yes)),
      no: nFormatter(_.size(grouped.No)),
      abstain: nFormatter(_.size(grouped.Abstain)),
    };
  }, [dataUpdatedAt]);
};

export const useProposalVotes = () => {
  const proposalAddress = useProposalAddress();
  const query = useProposalStateQuery(proposalAddress);
  const walletAddress = useConnectionStore().address;

  const _proposalVotes = query.data?.votes;
  const size = _.size(_proposalVotes);

  const { proposalVotes, walletVote } = useMemo(() => {
    return {
      proposalVotes: _.filter(
        _proposalVotes,
        (it) => it.address !== walletAddress
      ),
      walletVote: _.find(_proposalVotes, (it) => it.address === walletAddress),
    };
  }, [size, walletAddress]);

  return { ...query, proposalVotes, walletVote };
};

export const useVerifyProposalResults = () => {
  const proposalAddress = useProposalAddress();

   const currentProposalResults = useProposalStateQuery(proposalAddress).data?.results;

  const maxLt = useProposalStateQuery(proposalAddress).data?.maxLt;

  const query = useMutation(async () => {
    const compare = (first: any, second: any) => {
      const firstValue = isNaN(first) ? 0 : Number(first);
      const secondValue = isNaN(second) ? 0 : Number(second);

      return firstValue === secondValue;
    };

    analytics.GA.verifyButtonClick();

    const contractProposal = await contract.getDaoProposalInfo(proposalAddress);
    const contractState = await contract.getState(
      proposalAddress,
      contractProposal,
      { maxLt } as ProposalState
    );

    Logger({
      currentProposalResults,
      contractProposalResults: contractState?.results,
    });

    const yes = compare(
      currentProposalResults?.yes,
      contractState?.results.yes
    );

    const no = compare(currentProposalResults?.no, contractState?.results.no);
    const totalWeight = compare(
      currentProposalResults?.totalWeight,
      contractState?.results.totalWeight
    );
    const abstain = compare(
      currentProposalResults?.abstain,
      contractState?.results.abstain
    );

    return yes && no && abstain && totalWeight;
  });

  return {
    ...query,
    isReady: !!currentProposalResults,
  };
};

export const useVote = () => {
  const query = useSendTransaction();
  const proposalAddress = useProposalAddress();
  const { refetch: fetchState } = useProposalStateQuery(proposalAddress);
  const { setLatestMaxLtAfterTx } = useAppPersistedStore();

  const onFinished = async () => {
    const state = await fetchState();
    setLatestMaxLtAfterTx(proposalAddress, state.data?.maxLt);
  };

  const mutate = (vote: string) => {
    const args = {
      analytics: {
        submitted: () => analytics.GA.txSubmitted(vote),
        success: () => analytics.GA.txCompleted(vote),
        error: (error: string) => analytics.GA.txFailed(vote, error),
      },
      onFinished,
      message: vote,
      contractAddress: proposalAddress,
    };
    query.mutate(args);
  };

  return {
    ...query,
    mutate,
  };
};
