import { styled, useMediaQuery } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Deadline } from "./Deadline";
import { Metadata } from "./Metadata";
import { ProposalResults } from "./ProposalResults";
import { ProposalVotes } from "./ProposalVotes";
import { appNavigation } from "router/navigation";
import { useAppParams, useHiddenProposal } from "hooks/hooks";
import { useEffect, useState } from "react";
import { Page } from "wrappers";
import { useProposalQuery } from "query/getters";
import Vote from "./Vote";
import { ProposalAbout } from "./ProposalAbout";

const gap = 15;

const Destop = () => {
  return (
    <StyledWrapper>
      <StyledLeft>
        <ProposalAbout  />
        <Vote />
        <ProposalVotes />
      </StyledLeft>
      <StyledRight>
        <Deadline />
        <Metadata />
        <ProposalResults />
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = () => {

  return (
    <StyledFlexColumn gap={7.5}>
      <StyledWrapper>
        <Deadline />
        <ProposalAbout />
      </StyledWrapper>
      <Vote />
      <StyledWrapper>
        <ProposalResults />
        <Metadata />
        <ProposalVotes />
      </StyledWrapper>
    </StyledFlexColumn>
  );
};

export function ProposalDisplay() {
  const mobile = useMediaQuery("(max-width:800px)");
  const [showError, setShowError] = useState(false);
  const { daoAddress, proposalAddress } = useAppParams();
  const error = useProposalQuery(proposalAddress).error;
  const hideProposal = useHiddenProposal(proposalAddress);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  return (
    <Page
      error={hideProposal || showError}
      errorText="Proposal not found"
      // headerComponent={<ProposalMenu />}
      back={appNavigation.daoPage.root(daoAddress)}
    >
      {mobile ? <Mobile /> : <Destop />}
    </Page>
  );
}

export default ProposalDisplay;

const StyledWrapper = styled(StyledFlexRow)({
  gap,
  alignItems: "flex-start",
  "@media (max-width: 850px)": {
    flexDirection: "column",
  },
});

const StyledLeft = styled(StyledFlexColumn)({
  width: "calc(100% - 370px - 10px)",
  gap,
});

const StyledRight = styled(StyledFlexColumn)({
  width: 370,
  gap,
});
