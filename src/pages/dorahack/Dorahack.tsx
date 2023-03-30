import { styled, useMediaQuery } from "@mui/material";
import { EndpointPopup } from "components";
import {
  MainLayout,
  VoteLayout,
  ResultsLayout,
  InformationLayout,
  VotesLayout,
} from "layouts";
import DeadlineLayout from "layouts/DeadlineLayout";
import { StyledFlexColumn, StyledFlexRow } from "styles";

const Destop = () => {
  return (
    <StyledWrapper>
      <StyledLeft>
        <MainLayout />
        <VoteLayout />
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
      <VoteLayout />
      <ResultsLayout />
      <InformationLayout />
      <VotesLayout />
    </StyledWrapper>
  );
};

export function DorahackPage() {
  const match = useMediaQuery("(max-width:800px)");

  return (
    <>
      <EndpointPopup />
      {match ? <Mobile /> : <Destop />}
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
  // position: "sticky",
  // top: 90,
});
