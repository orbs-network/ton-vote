import { Chip } from "@mui/material";
import { useProposalStatusText } from "hooks";
import React from "react";
import { ProposalStatus } from "types";

export function Status({ status }: { status: ProposalStatus | null }) {
  const label = useProposalStatusText(status);
  if (!status) return null;
  return <Chip label={label} className="status" color="primary" />;
}
