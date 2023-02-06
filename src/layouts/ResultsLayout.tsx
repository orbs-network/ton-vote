import { Typography } from "@mui/material";
import { styled } from "@mui/material";
import { Container, Progress } from "components";
import { useStateDataStore } from "store";
import { StyledFlexColumn, StyledFlexRow } from "styles";

export const ResultsLayout = () => {
  const currectResults = useStateDataStore(state => state.proposalResults);
  

  return (
    <StyledResults title="Results" loaderAmount={3} loading={!currectResults}>
      {currectResults && (
        <StyledFlexColumn>
          <ResultRow name="Yes" percent={currectResults?.yes || 0} />
          <ResultRow name="No" percent={currectResults?.no || 0} />
          <ResultRow name="Abstain" percent={currectResults?.abstain || 0} />
        </StyledFlexColumn>
      )}
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
