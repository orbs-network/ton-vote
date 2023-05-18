import { Box, styled } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { ConnectButton } from "components";
import React from "react";
import { StyledFlexRow } from "styles";

export function Submit({ children }: { children: React.ReactNode }) {
  const address = useTonAddress();

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
