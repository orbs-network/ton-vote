import { styled, useMediaQuery } from "@mui/material";
import {
  MainLayout,
  VoteLayout,
  ResultsLayout,
  InformationLayout,
  VotesLayout,
  DeadlineLayout,
} from "./layouts";
import { StyledFlexColumn, StyledFlexRow, StyledGrid } from "styles";
import { EndpointPopup } from "./EndpointPopup";

const Desktop = () => {
  return (
    <StyledWrapper>
      <StyledLeft>
        <MainLayout />
        <VotesLayout />
      </StyledLeft>
      <StyledRight>
        <DeadlineLayout />
        <InformationLayout />
        <ResultsLayout />
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = () => {
  return (
    <StyledWrapper>
      <DeadlineLayout />
      <MainLayout />
      <ResultsLayout />
      <InformationLayout />
      <VotesLayout />
    </StyledWrapper>
  );
};

export function FrozenPage() {
  const match = useMediaQuery("(max-width:800px)");

  return (
    <>
      <EndpointPopup />
      {match ? <Mobile /> : <Desktop />}
    </>
  );
}

const StyledWrapper = styled(StyledFlexRow)({
  alignItems: "flex-start",
  "@media (max-width: 850px)": {
    flexDirection: "column",
  },
});

const StyledLeft = styled(StyledFlexColumn)({
  flex: 1,
});

const StyledRight = styled(StyledFlexColumn)({
  width: 370,
  position: "sticky",
  top: 90,
});
