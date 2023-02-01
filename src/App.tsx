import { styled, useMediaQuery } from "@mui/material";
import { Box } from "@mui/system";
import { EndpointPopup } from "components";
import { Countdown } from "components/Coundown";
import { DEADLINE } from "config";
import {
  MainLayout,
  VoteLayout,
  ResultsLayout,
  InformationLayout,
  Navbar,
  VotesLayout,
  Footer,
} from "layouts";
import { useGetTransactions } from "queries";
import { useEffect } from "react";
import { useGetClientsOnLoad } from "store/client-store";
import { useEagerlyConnect } from "store/wallet-store";
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
        <InformationLayout />
        <ResultsLayout />
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = () => {
  return (
    <StyledWrapper>
      <MainLayout />
      <VoteLayout />
      <ResultsLayout />
      <InformationLayout />
      <VotesLayout />
    </StyledWrapper>
  );
};

function App() {
  const restoreConnection = useEagerlyConnect();
  const getClients = useGetClientsOnLoad();
  useGetTransactions();

  useEffect(() => {
    restoreConnection();
    getClients();
  }, []);
  const match = useMediaQuery("(max-width:800px)");
  return (
    <StyledApp>
      <Navbar />
      <StyledGrid>{match ? <Mobile /> : <Destop />}</StyledGrid>
      <Footer />
      <EndpointPopup />
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
  width: 340,
  position: "sticky",
  top: 90,
});
