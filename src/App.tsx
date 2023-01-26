import { styled, useMediaQuery } from "@mui/material";
import { Box } from "@mui/system";
import {
  MainLayout,
  VoteLayout,
  ResultsLayout,
  InformationLayout,
  Navbar,
  VotesLayout,
  Footer,
} from "layouts";
import {
  useClientV2Query,
  useClientV4Query,
  useTransactionsQuery,
  useTransactionsRefetchQuery,
  useTransactionsTest,
} from "queries";
import { useEffect } from "react";
import { useClient, useClient4 } from "store/client-store";
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

const useOnAppReady = () => {
  useTransactionsRefetchQuery();
  const restoreConnection = useEagerlyConnect();
 
  // useTransactionsTest()
  useEffect(() => {
    restoreConnection();
  }, []);
};

function App() {
  useOnAppReady();
  const match = useMediaQuery("(max-width:800px)");
  return (
    <StyledApp>
      <Navbar />

      <StyledGrid>{match ? <Mobile /> : <Destop />}</StyledGrid>
      <Footer />
    </StyledApp>
  );
}

const AppWrapper = () => {
   useClientV2Query();
   useClientV4Query();

   const {client} = useClient()
   const {client4} = useClient4()

   if(!client4 || !client) {
    return null
   }
   return <App />
}


export default AppWrapper;

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
