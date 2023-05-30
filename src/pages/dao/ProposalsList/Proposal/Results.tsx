import { styled, Typography } from "@mui/material";
import { useProposalResults } from "hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useProposalQuery } from "query/getters";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { getSymbol, getVoteStrategyType } from "utils";
import { StyledAlert, StyledProposalPercent, StyledProposalResult, StyledProposalResultContent, StyledProposalResultProgress, StyledResultName, StyledTonAmount } from "../styles";

export const Results = ({
  proposalQuery,
}: {
  proposalQuery: ReturnType<typeof useProposalQuery>;
}) => {
  const { data: proposal, dataUpdatedAt } = proposalQuery;
  const totalWeight = proposal?.proposalResult.totalWeight;
  const translations = useDaoPageTranslations();
  const results = useProposalResults(proposal, dataUpdatedAt);
  if (Number(totalWeight) === 0) {
    return (
      <StyledAlert severity="warning">
        <Typography>{translations.endedAndDidntPassedQuorum}</Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledResults gap={10}>
      {results.map((result) => {
        return (
          <Result
            votingPowerStrategy={getVoteStrategyType(
              proposal?.metadata?.votingPowerStrategies
            )}
            key={result.choice}
            title={result.choice}
            percent={result.percent}
            tonAmount={result.tonAmount}
          />
        );
      })}
    </StyledResults>
  );
};

const Result = ({
  title,
  percent = 0,
  tonAmount = "0",
  votingPowerStrategy,
}: {
  title: string;
  percent?: number;
  tonAmount?: string;
  votingPowerStrategy?: VotingPowerStrategyType;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <StyledResultName text={title} />
          <StyledTonAmount>
            {tonAmount} {getSymbol(votingPowerStrategy)}
          </StyledTonAmount>
        </StyledFlexRow>
        <StyledProposalPercent>{percent}%</StyledProposalPercent>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};

const StyledResults = styled(StyledFlexColumn)({
  width: "100%",
});
