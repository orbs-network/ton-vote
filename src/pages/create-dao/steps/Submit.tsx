import { Box, styled } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { Button, ConnectButton } from "components";
import React from "react";
import { StyledFlexRow } from "styles";
import { Webapp, WebappButton } from "WebApp";

export function Submit({
  text,
  isLoading,
  onClick,
}: {
  text: string;
  isLoading?: boolean;
  onClick: () => void;
}) {
  const address = useTonAddress();

  if (Webapp.isEnabled) {
    return <WebappButton text={text} progress={isLoading} onClick={onClick} />;
  }

  if (!address) {
    return (
      <StyledContainer>
        <ConnectButton />
      </StyledContainer>
    );
  }
  return <StyledContainer>
    <Button onClick={onClick} isLoading={isLoading}>{text}</Button>
  </StyledContainer>;
}

export const StyledContainer = styled(StyledFlexRow)({
  width:'100%',
  marginTop: 50,
  gap: 20,
  button: {
    width:'100%'
  },
});
