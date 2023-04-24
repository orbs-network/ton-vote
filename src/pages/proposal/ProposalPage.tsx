import { styled, useMediaQuery } from "@mui/material";
import { Page } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Deadline } from "./Deadline";
import { Metadata } from "./Metadata";
import { Results } from "./Results";
import { Vote } from "./Vote";
import { Votes } from "./Votes";
import { Helmet } from "react-helmet";
import { APP_TITLE } from "config";
import { appNavigation } from "router";
import { useDaoAddress, useProposalAddress } from "hooks";
import { useProposalStatusQuery } from "query/queries";
import { ProposalStatus } from "types";
import { useProposalPageQuery } from "./query";
import { ProposalDescription } from "./ProposalDescription";

const useComponents = () => {
  const proposalAddress = useProposalAddress();
  const { data, isLoading } = useProposalPageQuery(false);

  const status = useProposalStatusQuery(data?.metadata, proposalAddress);

  return {
    proposalDescription: <ProposalDescription />,
    votes: !status || status === ProposalStatus.NOT_STARTED ? null : <Votes />,
    vote:
      !status || status !== ProposalStatus.ACTIVE || isLoading ? null : (
        <Vote proposalStatus={status} />
      ),
    deadline:
      !status || status === ProposalStatus.CLOSED ? null : (
        <Deadline proposalStatus={status} />
      ),
    metadata: <Metadata />,
    results:
      !status || status === ProposalStatus.NOT_STARTED ? null : <Results />,
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
  const title = useProposalPageQuery(false).data?.metadata?.title;

  return (
    <Helmet>
      <title>
        {APP_TITLE}
        {title ? ` - ${title}` : ""}
      </title>
    </Helmet>
  );
};

export function ProposalPage() {
  const mobile = useMediaQuery("(max-width:800px)");
  const daoAddress = useDaoAddress();

  return (
    <Page back={appNavigation.daoPage.root(daoAddress)}>
      <Meta />
      {mobile ? <Mobile /> : <Destop />}
    </Page>
  );
}

const StyledWrapper = styled(StyledFlexRow)({
  alignItems: "flex-start",
  "@media (max-width: 850px)": {
    flexDirection: "column",
  },
});

const StyledLeft = styled(StyledFlexColumn)({
  width: "calc(100% - 370px - 10px)",
});

const StyledRight = styled(StyledFlexColumn)({
  width: 370,
});
