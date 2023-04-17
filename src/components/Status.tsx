import { Chip } from "@mui/material";
import React from "react";
import { ProposalStatus } from "types";
import { getProposalStatusText } from "utils";

export function Status({ status }: { status: ProposalStatus | null }) {
  if (!status) return null;
  return (
    <Chip
      label={getProposalStatusText(status)}
      className="status"
      color="primary"
    />
  );
}
