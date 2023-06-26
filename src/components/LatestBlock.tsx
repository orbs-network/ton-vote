import { Box, keyframes, styled, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyledFlexRow } from "styles";
import { AppTooltip } from "./Tooltip";

export function LatestBlock() {
  const { data } = useQuery(
    ["getLatestBlock"],
    () => {
      return 24234234;
    },
    {
      refetchInterval: 1000,
    }
  );
  return (
    <StyledContainer>
      <AppTooltip
        placement="left"
        text="The most recent block number on this  network. Prices update on every block."
      >
        <StyledContent>
          <Typography>{data}</Typography>
          {/* <StyledCircle /> */}
        </StyledContent>
      </AppTooltip>
    </StyledContainer>
  );
}

const glow = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.8;
  }
`;

const StyledCircle = styled(Box)({
  animation: `${glow} 1s ease-in-out infinite alternate`,
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "yellow",
});

const StyledContent = styled(StyledFlexRow)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: 5
}));

const StyledContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  right: 20,
  bottom: 20,
  zIndex: 100,
  color: theme.palette.text.primary,
  p: {
    fontSize: 12,
  },
}));
