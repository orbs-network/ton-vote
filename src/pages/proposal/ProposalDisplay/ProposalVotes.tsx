import { useAppParams, useIsValidatorsProposal } from "hooks/hooks";
import React from "react";
import { RegularProposalVotes } from "./RegularProposal/RegularProposalVotes";
import { ValidatorsProposalVotes } from "./ValidatorsProposal/ValidatorsProposalVotes";

export function ProposalVotes() {
  const { proposalAddress } = useAppParams();
  const isValidatorsProposal = useIsValidatorsProposal(proposalAddress);

  return isValidatorsProposal ? (
    <ValidatorsProposalVotes />
  ) : (
    <RegularProposalVotes />
  );
}
