import React from "react";
import { AppTooltip } from "./Tooltip";
import { VscVerifiedFilled } from "react-icons/vsc";
import { Box, styled, Typography } from "@mui/material";
import { StyledFlexRow } from "styles";
import { useIsDaoVerified } from "query/getters";

export function VerifiedDao({ daoAddress = "" }: { daoAddress?: string }) {
  const isVerified = useIsDaoVerified(daoAddress);

  if (!isVerified) {
    return null;
  }
  return (
    <AppTooltip
      text={
        <>
          Verified space. <br /> This space proved ownership of his domain
        </>
      }
    >
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
