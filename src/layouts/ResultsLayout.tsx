import { Typography } from "@mui/material";
import { styled } from "@mui/material";
import { Container, Progress } from "components";
import { useCurrentResultsQuery } from "queries";
import { StyledFlexColumn, StyledFlexRow } from "styles";

const title = "Results";
export const ResultsLayout = () => {
  const currectResults = useCurrentResultsQuery();


  if (!currectResults) {
    return (
      <StyledResults title={title}>
        <Typography>Loading</Typography>
      </StyledResults>
    );
  }
  return (
    <StyledResults title={title}>
      <StyledFlexColumn>
        <ResultRow name="Yes" percent={currectResults?.yes} />
        <ResultRow name="No" percent={currectResults?.no} />
        <ResultRow name="Abstain" percent={currectResults?.abstain} />
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
