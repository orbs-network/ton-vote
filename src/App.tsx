import { styled, useMediaQuery } from "@mui/material";
import { Box } from "@mui/system";
import { EndpointPopup } from "components";
import {
  useConnectionEvenSubscription,
  useEmbededWallet,
  useRestoreConnection,
} from "connection";
import {
  MainLayout,
  VoteLayout,
  ResultsLayout,
  InformationLayout,
  Navbar,
  VotesLayout,
  Footer,
} from "layouts";
import DeadlineLayout from "layouts/DeadlineLayout";
import { useEffect } from "react";
import { useGetClientsOnLoad } from "store";
import { StyledFlexColumn, StyledFlexRow, StyledGrid } from "styles";

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

function App() {
  const restoreConnection = useRestoreConnection();
  const getClients = useGetClientsOnLoad();
  useConnectionEvenSubscription();
  const handleEmbededWallet = useEmbededWallet();

  useEffect(() => {
    restoreConnection();
    getClients();
    handleEmbededWallet();
  }, []);
  const match = useMediaQuery("(max-width:800px)");

  return (
    <StyledApp>
      <Navbar />
      <StyledGrid>{match ? <Mobile /> : <Destop />}</StyledGrid>
      <Footer />
      {/* <EndpointPopup /> */}
    </StyledApp>
  );
}

export default App;

const StyledWrapper = styled(StyledFlexRow)({
  alignItems: "flex-start",
  "@media (max-width: 850px)": {
    flexDirection: "column",
  },
});

const StyledApp = styled(Box)({
  paddingTop: 100,
  paddingBottom: 0,
});

const StyledLeft = styled(StyledFlexColumn)({
  flex: 1,
});

const StyledRight = styled(StyledFlexColumn)({
  width: 370,
  position: "sticky",
  top: 90,
});
