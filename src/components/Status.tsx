import { Chip, useTheme } from "@mui/material";
import { useProposalStatusText } from "hooks";
import React from "react";
import { ProposalStatus } from "types";


const getColor = (
  status: ProposalStatus | null
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return "primary";
    case ProposalStatus.NOT_STARTED:
      return "primary";
    case ProposalStatus.CLOSED:
      return "primary";

    default:
      return "primary";
  }
};

export function Status({ status }: { status: ProposalStatus | null }) {
  const label = useProposalStatusText(status);
  if (!status) return null;
  return <Chip label={label} className="status" color='primary' />;
}
