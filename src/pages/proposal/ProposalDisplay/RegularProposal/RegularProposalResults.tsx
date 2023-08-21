import { useAppParams, useProposalResults } from "hooks/hooks";
import React from "react";
import { Results } from "../Components/Results";

export function RegularProposalResults() {
  const { proposalAddress } = useAppParams();

  const results = useProposalResults(proposalAddress);

  return <Results results={results} />;
}

