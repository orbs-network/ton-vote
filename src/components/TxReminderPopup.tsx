import { Backdrop, CircularProgress, styled, Typography } from "@mui/material";
import React from "react";
import { useSelectedProvider } from "store/wallet-store";
import { StyledFlexColumn } from "styles";
import { Popup } from "./Popup";

export function TxReminderPopup({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const selectedProvider = useSelectedProvider();

  if (!selectedProvider?.reminder) return null;
  return (
    <Popup open={open} close={close}>
      <StyledContainer>
        <Typography>{selectedProvider.reminder}</Typography>
        <CircularProgress />
      </StyledContainer>
    </Popup>
  );
}

const StyledContainer = styled(StyledFlexColumn)({
  gap: 30
});
