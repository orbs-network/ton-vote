import { Box, styled } from "@mui/material";
import { ConnectButton } from "components";
import { useConnection } from "ConnectionProvider";
import React from "react";
import { StyledFlexRow } from "styles";

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

export const StyledContainer = styled(StyledFlexRow)({
  width:'100%',
  marginTop: 50,
  gap: 20,
  button: {
    width:'100%'
  },
});
