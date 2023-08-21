import { CircularProgress, styled, Typography } from "@mui/material";
import { Button, InfoMessage, NumberDisplay, Popup } from "components";
import { isTwaApp } from "consts";
import { useAppParams } from "hooks/hooks";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import {
  useWalletVotingPowerQuery,
  useProposalQuery,
} from "query/getters";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useVoteContext } from "./context";

interface Props {
  onSubmit: () => void;
}

export function VoteConfirmation({ onSubmit }: Props) {
  const translations = useProposalPageTranslations();
  const {confirmation, setConfirmation, vote} = useVoteContext()

  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);

  const {
    data: votingData,
    isLoading: votingDataLoading,
  } = useWalletVotingPowerQuery(data, proposalAddress);

  const votingPower = votingData?.votingPower;
  
  const NoVotingPower = !votingPower
    ? true
    : votingPower && Number(votingPower) === 0
    ? true
    : false;

  return (
    <StyledPopup
      title={translations.castVote}
      open={confirmation}
      onClose={() => setConfirmation(false)}
    >
      <StyledContainer gap={30}>
        <StyledFlexColumn>
          <StyledVote label={translations.choice} value={vote} />
          {data?.metadata?.mcSnapshotBlock && (
            <Row
              label={translations.snapshot}
              value={<NumberDisplay value={data?.metadata?.mcSnapshotBlock} />}
            />
          )}
          <Row
            isLoading={votingDataLoading}
            label={translations.yourVotingPower}
            value={votingData?.votingPowerText}
          />
        </StyledFlexColumn>
        {!votingDataLoading && NoVotingPower && (
          <InfoMessage
            message={translations.notEnoughVotingPower(
              data?.metadata?.mcSnapshotBlock.toLocaleString() || ""
            )}
          />
        )}
        {!isTwaApp && (
          <StyledButtons>
            <Button
              variant="transparent"
              onClick={() => setConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={NoVotingPower || votingDataLoading}
              onClick={() => {
                onSubmit();
                setConfirmation(false);
              }}
            >
              {translations.confirm}
            </Button>
          </StyledButtons>
        )}
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
