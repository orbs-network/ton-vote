import { styled, Typography } from "@mui/material";
import { useGetProposalSymbol, useProposalResults } from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useProposalQuery } from "query/getters";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { StyledAlert, StyledProposalPercent, StyledProposalResult, StyledProposalResultContent, StyledProposalResultProgress, StyledResultName, StyledTonAmount } from "../styles";

export const Results = ({
  proposalAddress,
}: {
  proposalAddress: string;
}) => {
  const { data: proposal } = useProposalQuery(proposalAddress);

  const totalWeight = proposal?.proposalResult.totalWeights;
  const translations = useDaoPageTranslations();
  const results = useProposalResults(proposalAddress);

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
            key={result.label}
            title={result.label}
            percent={result.percent}
            amount={result.assetAmount}
          />
        );
      })}
    </StyledResults>
  );
};

const Result = ({
  title,
  percent = 0,
  amount = "",
}: {
  title: string;
  percent?: number;
  amount?: string;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <StyledResultName text={title} />
          <StyledTonAmount>
            {amount}
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
