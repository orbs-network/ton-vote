import { styled, useMediaQuery } from "@mui/material";
import { Page } from "components";
import { useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Deadline } from "./Deadline";
import { Hero } from "./Hero";
import { Information } from "./Information";
import { useWalletAddressListener } from "./query";
import { Results } from "./Results";
import { useProposalStore } from "./store";
import { Vote } from "./Vote";
import { Votes } from "./Votes";

const Destop = () => {
  return (
    <StyledWrapper>
      <StyledLeft>
        <Hero />
        <Vote />
        <Votes />
      </StyledLeft>
      <StyledRight>
        <Deadline />
        <Information />
        <Results />
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = () => {
  return (
    <StyledWrapper>
      <Deadline />
      <Hero />
      <Vote />
      <Results />
      <Information />
      <Votes />
    </StyledWrapper>
  );
};

function ProposalPage() {
  const mobile = useMediaQuery("(max-width:800px)");
  useWalletAddressListener();
  const resetStore = useProposalStore((store) => store.reset);

  useEffect(() => {
    return () => {
      resetStore();
    };
  }, []);

  return <Page>{mobile ? <Mobile /> : <Destop />}</Page>;
}

export { ProposalPage };

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
