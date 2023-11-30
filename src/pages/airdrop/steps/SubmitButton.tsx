import { styled, Typography } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { Button, ConnectButton, Popup } from "components";
import React, { ReactNode, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useIsAirdropStateChanged, useStartNewAirdropCallback } from "../hooks";

import { useRevertAirdropChangesCallback } from "../hooks";
import { useAirdropStore, useAirdropStoreCopy } from "../store";
import { Steps } from "../types";

export function SubmitButtonContainer({
  onClick,
  children,
  isLoading,
}: {
  onClick: () => void;
  children: ReactNode;
  isLoading?: boolean;
}) {
  const address = useTonAddress();
  const isStateChanged = useIsAirdropStateChanged();
  const [open, setOpen] = useState(false);

  const _onClick = () => {
    const changed = isStateChanged();
    if (changed) {
      setOpen(true);
    } else {
      onClick();
    }
  };

  if (!address) {
    return (
      <StyledContainer>
        <ConnectButton />
      </StyledContainer>
    );
  }
  return (
    <StyledContainer>
      <ChangedStateWarning
        onSubmit={onClick}
        onClose={() => setOpen(false)}
        open={open}
      />
      <Button isLoading={isLoading} onClick={_onClick}>
        {children}
      </Button>
    </StyledContainer>
  );
}

const StyledContainer = styled(StyledFlexRow)({
  marginTop: 30,
  button: {
    minWidth: 200,
  },
});

export function ChangedStateWarning({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const startNewAirdrop = useStartNewAirdropCallback();
  const revert = useRevertAirdropChangesCallback();
  const onCancel = () => {
    revert();
    onClose();
  };

  const _onSubmit = () => {
    startNewAirdrop();
    onSubmit();
    onClose();
  };
  return (
    <StyledPopup title="Reset" open={open} onClose={onClose}>
      <StyledFlexColumn gap={30}>
        <Typography>Are you sure?</Typography>
        <StyledFlexRow>
          <StyledButton onClick={onCancel}>No</StyledButton>
          <StyledButton onClick={_onSubmit}>Yes</StyledButton>
        </StyledFlexRow>
      </StyledFlexColumn>
    </StyledPopup>
  );
}

const StyledButton = styled(Button)({
  width: "50%",
});

const StyledPopup = styled(Popup)({
  maxWidth: 400,
});
