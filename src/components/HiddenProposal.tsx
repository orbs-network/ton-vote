import { Box, styled } from "@mui/material";
import React from "react";
import { AiFillEyeInvisible } from "react-icons/ai";
import { Proposal } from "types";
import { AppTooltip } from "./Tooltip";

export const HiddenProposal = ({
  proposal,
  className = "",
}: {
  proposal: Proposal;
  className?: string;
}) => {  
  if (!proposal.metadata?.hide) {
    return null;
  }
  return (
    <StyledContainer className={className}>
      <AppTooltip text="This proposal is hidden">
        <AiFillEyeInvisible />
      </AppTooltip>
    </StyledContainer>
  );
};

const StyledContainer = styled(Box)(({ theme }) => ({
  width: 25,
  height: 25,
  svg: {
    width: "100%",
    height: "100%",
  },
}));
