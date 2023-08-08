import { styled, useMediaQuery } from "@mui/material";
import { ProposalAbout } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Deadline } from "./Deadline";
import { Metadata } from "./Metadata";
import { Results } from "./Results";
import { Vote } from "./Vote";
import { Votes } from "./Votes";
import { appNavigation } from "router/navigation";
import { useAppParams, useHiddenProposal } from "hooks/hooks";
import { useEffect, useState } from "react";
import { Page } from "wrappers";
import { useProposalQuery } from "query/getters";
import ProposalMenu from "../ProposalMenu";


const gap = 15;

const Destop = () => {
  const { proposalAddress, daoAddress } = useAppParams();
  return (
    <StyledWrapper>
      <StyledLeft>
        <ProposalAbout
          proposalAddress={proposalAddress}
          daoAddress={daoAddress}
        />
        <Vote />
        <Votes />
      </StyledLeft>
      <StyledRight>
        <Deadline />
        <Metadata />
        <Results />
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = () => {
  const { proposalAddress, daoAddress } = useAppParams();

  return (
    <StyledWrapper>
      <Deadline />
      <ProposalAbout
        proposalAddress={proposalAddress}
        daoAddress={daoAddress}
      />
      <Vote />
      <Results />
      <Metadata />
      <Votes />
    </StyledWrapper>
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
      headerComponent={<ProposalMenu />}
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
