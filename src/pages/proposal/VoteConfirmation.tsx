import { styled, Typography } from "@mui/material";
import { Button, NumberDisplay, Popup } from "components";
import { useConnection } from "ConnectionProvider";
import React, { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { VotingPower } from "ton-vote-sdk";


interface Props {
  open: boolean;
  onClose: () => void;
  vote: string;
  snapshot?: number;
  votingPower?: VotingPower;
  onSubmit: () => void;
}

export function VoteConfirmation({
  open,
  onClose,
  vote,
  snapshot,
  votingPower = {} as VotingPower,
  onSubmit,
}: Props) {
  const { address } = useConnection();
  
  return (
    <StyledPopup title="Cast your vote" open={open} onClose={onClose}>
      <StyledContainer gap={40}>
        <StyledFlexColumn>
          <Row label="Choice" value={vote} />
          {snapshot && (
            <Row label="Snapshot" value={<NumberDisplay value={snapshot} />} />
          )}
          {address && (
            <Row label="Your voting power" value={votingPower[address]} />
          )}
        </StyledFlexColumn>
        <StyledFlexRow>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Confirm</Button>
        </StyledFlexRow>
      </StyledContainer>
    </StyledPopup>
  );
}

const StyledPopup = styled(Popup)({
  maxWidth: 400
});

const Row = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <StyledRow justifyContent='space-between'>
      <Typography className="label">{label}</Typography>
      <Typography className="value">{value}</Typography>
    </StyledRow>
  );
};

const StyledRow = styled(StyledFlexRow)({});

const StyledContainer = styled(StyledFlexColumn)({
  
});

