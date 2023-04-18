import { styled, useMediaQuery } from "@mui/material";
import { Page, ProposalDescription } from "components";
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
import { useProposalState } from "./hooks";
import { useProposalStatusQuery } from "query/queries";
import { ProposalStatus } from "types";

const useComponents = () => {
  const proposalAddress = useProposalAddress();
  const { data, isLoading, dataUpdatedAt } = useProposalState();
  const status = useProposalStatusQuery(data?.metadata, proposalAddress);

  return {
    proposalDescription: (
      <ProposalDescription metadata={data?.metadata} isLoading={isLoading} />
    ),
    votes:
      !status || status === ProposalStatus.NOT_STARTED ? null : (
        <Votes
          state={data}
          isLoading={isLoading}
          dataUpdatedAt={dataUpdatedAt}
        />
      ),
    vote: !status ? null : <Vote proposalStatus={status} />,
    deadline: !status ? null : (
      <Deadline proposalStatus={status} proposalMetadata={data?.metadata} />
    ),
    metadata: (
      <Metadata
        proposalAddress={proposalAddress}
        isLoading={isLoading}
        proposalMetadata={data?.metadata}
      />
    ),
    results:
      !status || status === ProposalStatus.NOT_STARTED ? null : (
        <Results
          votes={data?.votes}
          proposalResult={data?.proposalResult}
          isLoading={isLoading}
          dataUpdatedAt={dataUpdatedAt}
        />
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
  return (
    <Helmet>
      <title>
        {APP_TITLE}
        {/* {data ? `- ${data.title}` : ""} */}
      </title>
    </Helmet>
  );
};

function ProposalPage() {
  const mobile = useMediaQuery("(max-width:800px)");
  const daoAddress = useDaoAddress();

  return (
    <Page back={appNavigation.daoPage.root(daoAddress)}>
      <Meta />
      {mobile ? <Mobile /> : <Destop />}
    </Page>
  );
}

export { ProposalPage };

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
