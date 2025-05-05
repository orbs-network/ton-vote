import { Box, CircularProgress, styled, Typography } from "@mui/material";
import { Button, InfoMessage, NumberDisplay, Popup } from "components";
import { useAppParams, useGetProposalSymbol } from "hooks/hooks";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import {
  useConnectedWalletVotingPowerQuery,
  useProposalQuery,
} from "query/getters";
import React, { ReactNode, useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";

interface Props {
  open: boolean;
  onClose: () => void;
  vote?: string;
  onSubmit: () => void;
}

export function VoteConfirmation({ open, onClose, vote, onSubmit }: Props) {
  const translations = useProposalPageTranslations();

  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);

  const { data: votingData, isLoading: votingDataLoading } =
    useConnectedWalletVotingPowerQuery(data, proposalAddress, !open);

  const votingPower = votingData?.votingPower;
  
  const NoVotingPower = !votingPower
    ? true
    : votingPower && Number(votingPower) === 0
    ? true
    : false;
console.log(data?.metadata);

  return (
    <StyledPopup title={translations.castVote} open={open} onClose={onClose}>
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
        <StyledButtons>
          <Button variant="transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={NoVotingPower || votingDataLoading}
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
  alignItems:'flex-start',
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
