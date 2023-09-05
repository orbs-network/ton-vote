import { CircularProgress, Fade, styled, Typography } from "@mui/material";
import { InfoMessage, NumberDisplay } from "components";
import { MOBILE_WIDTH } from "consts";
import { useAppParams } from "hooks/hooks";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useProposalQuery } from "query/getters";
import { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useConnectedWalletVotingPower } from "../hooks";
import { useVoteContext } from "./context";

export const VoteOptions = ({
  ignoreSelected,
  className = "",
}: {
  ignoreSelected?: boolean;
  className?: string;
}) => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const choices = data?.metadata?.votingSystem.choices;
  const { setVote, vote } = useVoteContext();

  return (
    <StyledFlexColumn className={className}>
      {choices?.map((option) => {
        return (
          <StyledOption
            className="option"
            selected={
              !ignoreSelected && option?.toLowerCase() === vote?.toLowerCase()
            }
            key={option}
            onClick={() => setVote(option)}
          >
            <Fade in={!ignoreSelected && option === vote}>
              <StyledFlexRow className="icon">
                <FiCheck style={{ width: 20, height: 20 }} />
              </StyledFlexRow>
            </Fade>
            <Typography>{option}</Typography>
          </StyledOption>
        );
      })}
    </StyledFlexColumn>
  );
};

const StyledOption = styled(StyledFlexRow)<{
  selected?: boolean;
}>(({ theme, selected }) => ({
  transition: "0.2s all",
  width: "100%",
  borderRadius: 30,
  height: 40,
  cursor: "pointer",
  position: "relative",
  ".icon": {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: "translate(0, -50%)",
    width: "fit-content",
  },
  border: selected
    ? `1.5px solid ${theme.palette.primary.main}`
    : "1.5px solid rgba(114, 138, 150, 0.24)",
  color: theme.palette.mode === "light" ? theme.palette.primary.main : "white",
  p: {
    color: "inherit",
    fontWeight: 600,
    fontSize: 16,
  },
}));

export function VotePreview() {
  const translations = useProposalPageTranslations();
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const { vote } = useVoteContext();
  const { data: votingData, isLoading: votingDataLoading } =
    useConnectedWalletVotingPower();

  return (

      <StyledFlexColumn>
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
        {!votingDataLoading && !votingData?.hasVotingPower && (
          <InfoMessage
            message={translations.notEnoughVotingPower(
              data?.metadata?.mcSnapshotBlock.toLocaleString() || ""
            )}
          />
        )}
      </StyledFlexColumn>

  );
}

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
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    ".label": {
      fontSize: 15,
    },
    ".value": {
      fontSize: 15,
    },
  },
});

const StyledVote = styled(Row)({
  ".value": {
    textTransform: "capitalize",
  },
});
