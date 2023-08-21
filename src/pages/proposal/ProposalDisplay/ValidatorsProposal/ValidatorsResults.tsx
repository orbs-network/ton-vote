import { useAppParams, useGetValidatorsProposalResult } from "hooks/hooks";
import React from "react";
import { Results } from "../Components/Results";

export function ValidatorsResults() {
  const { proposalAddress } = useAppParams();

  const results = useGetValidatorsProposalResult(proposalAddress);
  return <Results results={results} />;
}

