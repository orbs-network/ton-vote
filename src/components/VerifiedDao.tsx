import React from "react";
import { AppTooltip } from "./Tooltip";
import { VscVerifiedFilled } from "react-icons/vsc";
import { VERIFIED_DAOS } from "config";
import { Box, styled } from "@mui/material";
import { StyledFlexRow } from "styles";

export function VerifiedDao({ daoAddress = "" }: { daoAddress?: string }) {
  if (!VERIFIED_DAOS.includes(daoAddress)) {
    return null;
  }
  return (
    <AppTooltip text="Verified space">
      <StyledContainer>
        <VscVerifiedFilled />
      </StyledContainer>
    </AppTooltip>
  );
}

const StyledContainer = styled(StyledFlexRow)(({ theme }) => ({
  svg: {
    color: theme.palette.primary.main, 
    width: 22,
    height: 22,
  },
}));
