import { styled, useMediaQuery } from "@mui/material";
import { ErrorContainer } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Deadline } from "./Deadline";
import { Metadata } from "./Metadata";
import { Results } from "./Results";
import { Vote } from "./Vote";
import { Votes } from "./Votes";
import { Helmet } from "react-helmet";
import { APP_NAME } from "config";
import { appNavigation } from "router/navigation";
import { useDaoAddressFromQueryParam } from "hooks";
import { ProposalStatus } from "types";
import { ProposalAbout } from "./ProposalAbout";
import { useProposalPageQuery, useProposalPageStatus } from "./hooks";
import { parseLanguage } from "utils";
import { useEffect, useState } from "react";
import { Page } from "wrappers";

const gap = 15;

const useComponents = () => {
  const isLoading = useProposalPageQuery().isLoading;

  const { proposalStatus } = useProposalPageStatus();

  return {
    proposalDescription: <ProposalAbout />,
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
    metadata: <Metadata />,
    results:
      !proposalStatus ||
      proposalStatus === ProposalStatus.NOT_STARTED ? null : (
        <Results />
      ),
  };
};

const Destop = () => {
  const { proposalDescription, votes, vote, deadline, metadata, results } =
    useComponents();

  return (
    <StyledWrapper>
      <StyledLeft>
        {proposalDescription}
        {vote}
        {votes}
      </StyledLeft>
      <StyledRight>
        {deadline}
        {metadata}
        {results}
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = () => {
  const { proposalDescription, votes, vote, deadline, metadata, results } =
    useComponents();

  return (
    <StyledWrapper>
      {deadline}
      {proposalDescription}
      {vote}
      {results}
      {metadata}
      {votes}
    </StyledWrapper>
  );
};

const Meta = () => {
  const title = useProposalPageQuery().data?.metadata?.title;

  return (
    <Helmet>
      <title>
        {APP_NAME}
        {title ? ` - ${parseLanguage(title)}` : ""}
      </title>
    </Helmet>
  );
};

export function Proposal() {
  const mobile = useMediaQuery("(max-width:800px)");
  const daoAddress = useDaoAddressFromQueryParam();
  const [showError, setShowError] = useState(false);
  const error = useProposalPageQuery().error;

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  return (
    <Page back={appNavigation.daoPage.root(daoAddress)}>
      <Meta />
      {showError ? (
        <ErrorContainer text="Proposal not found" />
      ) : mobile ? (
        <Mobile />
      ) : (
        <Destop />
      )}
    </Page>
  );
}

export default Proposal;

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
