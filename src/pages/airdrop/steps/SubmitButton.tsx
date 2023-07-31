import { styled, Typography } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { Button, ConnectButton, Popup } from "components";
import React, { ReactNode, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import {
  useRevertAirdropChanges,
  useValidateChangedAfterAirdropStarted,
} from "../hooks";

export function SubmitButtonContainer({
  onClick: onSubmit,
  children,
  isLoading,
}: {
  onClick: () => void;
  children: ReactNode;
  isLoading?: boolean;
}) {
  const address = useTonAddress();
  const [open, setOpen] = useState(false);
  const validateChanges = useValidateChangedAfterAirdropStarted();

  const onClick = () => {
    const hasChanges = validateChanges();
    if (hasChanges) {
      setOpen(true);
    } else {
      onSubmit();
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
        onSubmit={onSubmit}
        onClose={() => setOpen(false)}
        open={open}
      />
      <Button isLoading={isLoading} onClick={onClick}>
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
  onSubmit,
  onClose,
}: {
  open: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const revertChanges = useRevertAirdropChanges();
  const onCancel = () => {
    revertChanges();
    onClose();
  };

  return (
    <StyledPopup title="Reset" open={open} onClose={onClose}>
      <StyledFlexColumn gap={30}>
        <Typography>Are you sure?</Typography>
        <StyledFlexRow>
          <StyledButton onClick={onCancel}>No</StyledButton>
          <StyledButton
            onClick={() => {
              onSubmit();
              onClose();
            }}
          >
            Yes
          </StyledButton>
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
