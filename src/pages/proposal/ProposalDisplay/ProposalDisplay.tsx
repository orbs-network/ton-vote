import { styled, useMediaQuery } from "@mui/material";
import { AppTooltip, ErrorContainer } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Deadline } from "./Deadline";
import { Metadata } from "./Metadata";
import { Results } from "./Results";
import { Vote } from "./Vote";
import { Votes } from "./Votes";
import { appNavigation, useAppNavigation } from "router/navigation";
import {
  useAppParams,
  useDevFeatures,
  useHiddenProposal,
  useProposalStatus,
  useRole,
} from "hooks/hooks";
import { ProposalStatus } from "types";
import { ProposalAbout } from "./ProposalAbout";
import { useEffect, useState } from "react";
import { Page } from "wrappers";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { useDaoQuery, useProposalQuery } from "query/getters";
import { mock } from "mock/mock";
import ProposalMenu from "./ProposalMenu";

const gap = 15;

const useComponents = () => {
  const { proposalAddress } = useAppParams();
  const isLoading = useProposalQuery(proposalAddress).isLoading;

  const { proposalStatus } = useProposalStatus(proposalAddress);

  return {
    votes:
      !proposalStatus ||
      proposalStatus === ProposalStatus.NOT_STARTED ? null : (
        <Votes />
      ),
    vote:
      !proposalStatus ||
      proposalStatus !== ProposalStatus.ACTIVE ||
      isLoading ? null : (
        <Vote />
      ),
    deadline:
      !proposalStatus || proposalStatus === ProposalStatus.CLOSED ? null : (
        <Deadline />
      ),
    results:
      !proposalStatus ||
      proposalStatus === ProposalStatus.NOT_STARTED ? null : (
        <Results />
      ),
  };
};

const Destop = () => {
  const {  votes, vote, deadline, results } =
    useComponents();

  return (
    <StyledWrapper>
      <StyledLeft>
        <ProposalAbout />
        {vote}
        {votes}
      </StyledLeft>
      <StyledRight>
        {deadline}
       <Metadata />
        {results}
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = () => {
  const { votes, vote, deadline, results } =
    useComponents();

  return (
    <StyledWrapper>
      {deadline}
      <ProposalAbout />
      {vote}
      {results}
      <Metadata />
      {votes}
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

  const errorContainer = hideProposal || showError;


  return (
    <Page
    headerComponent={<ProposalMenu />}
      back={appNavigation.daoPage.root(daoAddress)}
    >
      {errorContainer ? (
        <ErrorContainer text="Proposal not found" />
      ) : mobile ? (
        <Mobile />
      ) : (
        <Destop />
      )}
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
