import { Backdrop, CircularProgress, styled, Typography } from "@mui/material";
import React from "react";
import { useSelectedProvider } from "store/wallet-store";
import { StyledFlexColumn } from "styles";
import { Popup } from "./Popup";

export function TxReminderPopup({
  open,
  close,
  text,
}: {
  open: boolean;
  close: () => void;
  text: string;
}) {

  if (!text) return null;
  return (
    <Popup open={open} close={close}>
      <StyledContainer>
        <Typography>{text}</Typography>
        <CircularProgress />
      </StyledContainer>
    </Popup>
  );
}

const StyledContainer = styled(StyledFlexColumn)({
  gap: 30,
  width:'calc(100vw - 50px)',
  maxWidth: 300,
  textAlign:'center',
  "p":{
    fontSize: 18,
    fontWeight: 500
  }
});
