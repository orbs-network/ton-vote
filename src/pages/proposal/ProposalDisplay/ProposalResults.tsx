import { useAppParams, useIsValidatorsProposal } from 'hooks/hooks';
import React from 'react'
import { RegularProposalResults } from './RegularProposal/RegularProposalResults';
import { ValidatorsResults } from './ValidatorsProposal/ValidatorsResults';

export function ProposalResults() {
  const { proposalAddress } = useAppParams();
  const isValidatorsProposal = useIsValidatorsProposal(proposalAddress);
  return isValidatorsProposal ? <ValidatorsResults /> : <RegularProposalResults /> ;
}

