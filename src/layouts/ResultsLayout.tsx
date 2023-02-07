import { Typography } from "@mui/material";
import { styled } from "@mui/material";
import { Container, Progress } from "components";
import { useStateQuery } from "queries";
import { StyledFlexColumn, StyledFlexRow } from "styles";

export const ResultsLayout = () => {
  const { data, isLoading } = useStateQuery();
  const results = data?.proposalResults;

  return (
    <StyledResults title="Results" loaderAmount={3} loading={isLoading}>
      <StyledFlexColumn>
        <ResultRow name="Yes" percent={results?.yes || 0} />
        <ResultRow name="No" percent={results?.no || 0} />
        <ResultRow name="Abstain" percent={results?.abstain || 0} />
      </StyledFlexColumn>
    </StyledResults>
  );
};

const ResultRow = ({
  name,
  percent = 0,
}: {
  name: string;
  percent?: number;
}) => {
  return (
    <StyledResultRow>
      <StyledFlexRow justifyContent="space-between" width="100%">
        <Typography>{name}</Typography>
        <Typography>{percent}%</Typography>
      </StyledFlexRow>
      <Progress progress={percent} />
    </StyledResultRow>
  );
};

const StyledResultRow = styled(StyledFlexColumn)({
  gap: 5,
  fontWeight: 600,
  p: {
    fontWeight: "inherit",
  },
});

const StyledResults = styled(Container)({
  width: "100%",
});
