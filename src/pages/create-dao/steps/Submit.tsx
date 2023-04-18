import { Box, styled } from "@mui/material";
import { ConnectButton } from "components";
import { useConnection } from "ConnectionProvider";
import React from "react";

export function Submit({ children }: { children: React.ReactNode }) {
  const address = useConnection().address;

  if (!address) {
    return (
      <StyledContainer>
        <ConnectButton />
      </StyledContainer>
    );
  }
  return <StyledContainer>{children}</StyledContainer>;
}

export const StyledContainer = styled(Box)({
  marginTop: 50,
  button: {
    minWidth: '120px',
  },
});
