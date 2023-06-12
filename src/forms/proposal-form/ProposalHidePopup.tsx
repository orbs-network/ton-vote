import { styled, Typography } from "@mui/material";
import { Button, Popup } from "components";
import React from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalHidePopupVariant } from "types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  variant: ProposalHidePopupVariant;
}

function ProposalHidePopup({ open, onClose, onSubmit, variant }: Props) {
  const content = useGetContent(variant);

  return (
    <StyledPopup open={open} onClose={onClose} title='Proposal visibility'>
      <StyledFlexColumn gap={40}>
        <StyledContent>{content}</StyledContent>
        <StyledButtons>
          <Button variant='transparent' onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Confirm</Button>
        </StyledButtons>
      </StyledFlexColumn>
    </StyledPopup>
  );
}

const useGetContent = (variant: ProposalHidePopupVariant) => {
  if (variant === "hide") {
    return "This proposal will be hidden from the list of proposals. You can change it later in the settings section.";
  }
  if (variant === "changed-to-hide") {
    return "This proposal will be hidden from the list of proposals. You can change it later in the settings section.";
  }
  return "This proposal will be visible in the list of proposals.";
};

export default ProposalHidePopup;

const StyledContent = styled(Typography)({
  fontSize: 17,
  fontWeight: 600,
});

const StyledButtons = styled(StyledFlexRow)({
    gap: 20,
    button:{
        width:'50%'
    }
})

const StyledPopup = styled(Popup)({
  maxWidth: 500,
});
