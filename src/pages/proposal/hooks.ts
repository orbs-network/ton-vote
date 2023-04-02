import analytics from "analytics";
import { useConnection } from "ConnectionProvider";
import { useProposalAddress } from "hooks";
import _ from "lodash";
import { useProposalStateQuery } from "query/queries";
import { useMemo } from "react";
import { useAppPersistedStore } from "store";
import { nFormatter } from "utils";

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
  const walletAddress = useConnection().address;

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

