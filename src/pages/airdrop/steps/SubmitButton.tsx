import { styled } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { Button, ConnectButton } from "components";
import React, { ReactNode } from "react";
import { StyledFlexRow } from "styles";

export function SubmitButtonContainer({ children }: { children: ReactNode }) {
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

const StyledContainer = styled(StyledFlexRow)({
  marginTop: 30,
  button: {
    minWidth: 200,
  },
});
