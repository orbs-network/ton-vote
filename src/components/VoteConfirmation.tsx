import { styled, Typography } from "@mui/material";
import React from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Button } from "./Button";
import { Popup } from "./Popup";

interface Props {
  open: boolean;
  onClose: () => void;
  vote: string;
  snapshot: number;
  votingPower: number;
  onSubmit: () => void;
}

export function VoteConfirmation({
  open,
  onClose,
  vote,
  snapshot,
  votingPower,
  onSubmit,
}: Props) {
  return (
    <Popup title="Cast your vote" open={open} onClose={onClose}>
      <StyledContainer gap={40}>
        <StyledFlexColumn>
          <Row label="Choice" value={vote} />
          <Row label="Snapshot" value={snapshot} />
          <Row label="Your voting power" value={votingPower} />
        </StyledFlexColumn>
        <StyledFlexRow>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Confirm</Button>
        </StyledFlexRow>
      </StyledContainer>
    </Popup>
  );
}

const Row = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <StyledRow justifyContent='space-between'>
      <Typography className="label">{label}</Typography>
      <Typography className="value">{value}</Typography>
    </StyledRow>
  );
};

const StyledRow = styled(StyledFlexRow)({});

const StyledContainer = styled(StyledFlexColumn)({
    width:'calc(100vw - 40px)',
    maxWidth: 400
});

