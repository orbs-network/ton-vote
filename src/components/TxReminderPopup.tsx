import { styled, Typography } from "@mui/material";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useTranslation } from "react-i18next";
import { useTxReminderPopup } from "store";
import { StyledFlexColumn } from "styles";
import { Button } from "./Button";
import { Popup } from "./Popup";

export function TxReminderPopup() {
  const { open, setOpen } = useTxReminderPopup();
  const translations = useCommonTranslations()

  return (
    <StyledPoup hideCloseButton open={open} onClose={() => setOpen(false)}>
      <StyledFlexColumn gap={30}>
        <StyledText>{translations.checkWallet}</StyledText>
        <StyledBtn onClick={() => setOpen(false)}>{translations.close}</StyledBtn>
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
