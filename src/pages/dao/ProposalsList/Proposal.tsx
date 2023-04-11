import { Chip, Typography, Fade, styled } from "@mui/material";
import { Loader } from "components";
import { useDaoAddress } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Address } from "ton-core";
import { ProposalMetadata } from "ton-vote-sdk";
import { Proposal, ProposalStatus } from "types";
import {
  makeElipsisAddress,
  getTimeDiff,
  nFormatter,
  getProposalStatusText,
  calculateTonAmount,
  getProposalStatus,
} from "utils";
import {
  StyledDescription,
  StyledLoader,
  StyledProposal,
  StyledProposalContent,
  StyledProposalOwner,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
} from "./styles";

const Time = ({
  proposalMetadata,
  status,
}: {
  proposalMetadata: ProposalMetadata;
  status: ProposalStatus | null;
}) => {
  if (!status) return null;

  if (status === ProposalStatus.NOT_STARTED) {
    return (
      <Typography className="time-left">
        Start in {getTimeDiff(proposalMetadata.proposalStartTime)}
      </Typography>
    );
  }
  return (
    <Typography className="time-left">
      {getTimeDiff(proposalMetadata.proposalEndTime)} Left
    </Typography>
  );
};

export const ProposalComponent = ({
  proposal,
  filterValue,
}: {
  proposal: Proposal;
  filterValue?: ProposalStatus;
}) => {
  const { proposalPage } = useAppNavigation();
  const daoAddress = useDaoAddress();
  // const status = useProposalStatusQuery(proposal.proposalAddr);
  const status = getProposalStatus(proposal.metadata);
  const roles = useDaoQuery(proposal.proposalAddr).data?.roles;
  const { metadata } = proposal;

  if (filterValue && status && status !== filterValue) return null;

  return (
    <StyledContainer
      isLoading={false}
      loader={<StyledLoader />}
      component={
        <StyledProposal
          onClick={() =>
            proposalPage.root(daoAddress, proposal.proposalAddr.toString())
          }
        >
          <StyledProposalContent className="container">
            <StyledFlexColumn alignItems="flex-start">
              <StyledFlexRow justifyContent="space-between">
                <Typography className="title">Title</Typography>
                <Chip
                  label={getProposalStatusText(status)}
                  className="status"
                  color="primary"
                />
              </StyledFlexRow>
              <StyledProposalOwner>
                Owner: {makeElipsisAddress(roles?.owner, 8)}
              </StyledProposalOwner>

              <StyledDescription>Description</StyledDescription>

              {status !== ProposalStatus.CLOSED && metadata && (
                <Time proposalMetadata={metadata} status={status} />
              )}

              {status && <Results address={proposal.proposalAddr} />}
            </StyledFlexColumn>
          </StyledProposalContent>
        </StyledProposal>
      }
    />
  );
};

const StyledContainer = styled(Loader)({
  width: "100%",
});

const Results = ({ address }: { address: string }) => {
  const results = {} as any;
  return (
    <StyledFlexColumn gap={5}>
      <Result
        title="Yes"
        percent={results?.yes}
        tonAmount={calculateTonAmount(results?.yes, results?.totalWeight)}
      />
      <Result
        title="No"
        percent={results?.no}
        tonAmount={calculateTonAmount(results?.no, results?.totalWeight)}
      />
      <Result
        title="Abstain"
        percent={results?.abstain}
        tonAmount={calculateTonAmount(results?.abstain, results?.totalWeight)}
      />
    </StyledFlexColumn>
  );
};

const Result = ({
  title,
  percent = 0,
  tonAmount = "0",
}: {
  title: string;
  percent?: number;
  tonAmount?: string;
}) => {
  percent = isNaN(percent) ? 0 : percent;
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <Typography style={{ fontWeight: 700 }}>{title}</Typography>
          <Typography fontSize={13}>{tonAmount} TON</Typography>
        </StyledFlexRow>
        <Typography style={{ fontWeight: 700 }}>{percent}%</Typography>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};
