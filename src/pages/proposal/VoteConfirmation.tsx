import { Box, CircularProgress, styled, Typography } from "@mui/material";
import { Button, InfoMessage, NumberDisplay, Popup } from "components";
import { useConnection } from "ConnectionProvider";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import React, { ReactNode, useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { fromNano } from "ton-core";
import { getSymbol, getVoteStrategyType, nFormatter } from "utils";
import { useProposalPageQuery, useWalletVotingPower } from "./query";

interface Props {
  open: boolean;
  onClose: () => void;
  vote?: string;
  onSubmit: () => void;
}

export function VoteConfirmation({ open, onClose, vote, onSubmit }: Props) {
  const { address } = useConnection();
  const translations = useProposalPageTranslations();

  const { data } = useProposalPageQuery(false);

  const {
    data: votingData,
    isLoading: votingDataLoading,
    refetch,
  } = useWalletVotingPower(address, data);

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open]);

  const NoVotingPower = votingData && Number(votingData) === 0 ? true : false;

  const pasredVotingPower = votingData
    ? nFormatter(Number(fromNano(votingData)))
    : 0;

  return (
    <StyledPopup title={translations.castVote} open={open} onClose={onClose}>
      <StyledContainer gap={30}>
        <StyledFlexColumn>
          <Row label={translations.choice} value={vote} />
          {data?.metadata?.mcSnapshotBlock && (
            <Row
              label={translations.snapshot}
              value={<NumberDisplay value={data?.metadata?.mcSnapshotBlock} />}
            />
          )}
          <Row
            isLoading={votingDataLoading}
            label={translations.yourVotingPower}
            value={`${pasredVotingPower} ${getSymbol(
              getVoteStrategyType(data?.metadata?.votingPowerStrategies)
            )}`}
          />
        </StyledFlexColumn>
        {NoVotingPower && (
          <InfoMessage
            message={translations.notEnoughVotingPower(
              data?.metadata?.mcSnapshotBlock.toLocaleString() || ""
            )}
          />
        )}
        <StyledButtons>
          <Button variant="transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={NoVotingPower}
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

const StyledMessage = styled(Box)({});

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
}: {
  label: string;
  value: ReactNode;
  isLoading?: boolean;
}) => {
  return (
    <StyledRow justifyContent="space-between">
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

const StyledContainer = styled(StyledFlexColumn)({});
