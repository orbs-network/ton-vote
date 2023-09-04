import { CircularProgress, styled, Typography } from "@mui/material";
import { Button, InfoMessage, NumberDisplay, Popup } from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useVoteConfirmation } from "./hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  vote?: string;
  onSubmit: () => void;
}

export function VoteConfirmation({ open, onClose, vote, onSubmit }: Props) {

  const { noVotingPower, translations, votingData, votingDataLoading, proposal } = useVoteConfirmation()

  return (
    <StyledPopup title={translations.castVote} open={open} onClose={onClose}>
      <StyledContainer gap={30}>
        <StyledFlexColumn>
          <StyledVote label={translations.choice} value={vote} />
          {proposal?.metadata?.mcSnapshotBlock && (
            <Row
              label={translations.snapshot}
              value={<NumberDisplay value={proposal?.metadata?.mcSnapshotBlock} />}
            />
          )}
          <Row
            isLoading={votingDataLoading}
            label={translations.yourVotingPower}
            value={votingData?.votingPowerText}
          />
        </StyledFlexColumn>
        {!votingDataLoading && noVotingPower && (
          <InfoMessage
            message={translations.notEnoughVotingPower(
              proposal?.metadata?.mcSnapshotBlock.toLocaleString() || ""
            )}
          />
        )}
        <StyledButtons>
          <Button variant="transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={noVotingPower || votingDataLoading}
            onClick={() => {
              onSubmit();
              onClose();
            }}
          >
            {translations.confirm}
          </Button>
        </StyledButtons>
      </StyledContainer>
    </StyledPopup>
  );
}

const StyledButtons = styled(StyledFlexRow)({
  button: {
    width: "50%",
  },
});

const StyledPopup = styled(Popup)({
  maxWidth: 400,
  padding: 0,
});

const Row = ({
  label,
  value,
  isLoading,
  className = "",
}: {
  label: string;
  value: ReactNode;
  isLoading?: boolean;
  className?: string;
}) => {
  return (
    <StyledRow className={className} justifyContent="space-between">
      <Typography className="label">{label}</Typography>
      {isLoading ? (
        <CircularProgress style={{ width: 20, height: 20 }} />
      ) : (
        <Typography className="value">{value}</Typography>
      )}
    </StyledRow>
  );
};

const StyledRow = styled(StyledFlexRow)({
  ".label": {
    fontWeight: 700,
  },
  ".value": {
    fontWeight: 600,
  },
});

const StyledVote = styled(Row)({
  ".value": {
    textTransform: "capitalize",
  },
});

const StyledContainer = styled(StyledFlexColumn)({});
