import { styled, Typography } from "@mui/material";
import { useTxReminderPopup } from "store";
import { StyledFlexColumn } from "styles";
import { Button } from "./Button";
import { Popup } from "./Popup";

export function TxReminderPopup() {
  const { text, open, setOpen } = useTxReminderPopup();

  return (
    <StyledPoup hideCloseButton open={open} onClose={() => setOpen(false)}>
      <StyledFlexColumn gap={30}>
        <StyledText>{text}</StyledText>
        <StyledBtn onClick={() => setOpen(false)}>Close</StyledBtn>
      </StyledFlexColumn>
    </StyledPoup>
  );
}

const StyledBtn = styled(Button)({
  minWidth: 160,
});

const StyledText = styled(Typography)({
  fontSize: 17,
  fontWeight: 600,
});

const StyledPoup = styled(Popup)({
  padding: 20,
  maxWidth: 400,
  textAlign: "center",
});
