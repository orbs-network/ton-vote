import { useAppParams } from "hooks/hooks";
import { ProposalPageTranslations, useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useProposalQuery, useConnectedWalletVotingPowerQuery } from "query/getters";
import { Proposal } from "types";

export type UseVoteConfirmationProps = {
  proposal: Proposal | null | undefined
  noVotingPower: boolean
  votingDataLoading: boolean
  refetch: () => void
  translations: ProposalPageTranslations
  votingData: {
    votingPower: string;
    votingPowerText: string;
} | undefined
}

export function useVoteConfirmation() {
  const translations = useProposalPageTranslations();

  const { proposalAddress } = useAppParams();
  const { data: proposal } = useProposalQuery(proposalAddress);

  const {
    data: votingData,
    isLoading: votingDataLoading,
    refetch,
  } = useConnectedWalletVotingPowerQuery(proposal, proposalAddress);

  const votingPower = votingData?.votingPower;
  
  const noVotingPower = !votingPower
    ? true
    : votingPower && Number(votingPower) === 0
    ? true
    : false;

  return {
    proposal,
    noVotingPower,
    votingDataLoading,
    refetch,
    translations,
    votingData
  }
}