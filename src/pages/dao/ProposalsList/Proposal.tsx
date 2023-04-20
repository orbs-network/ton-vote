import { Typography, styled, Box } from "@mui/material";
import {
  Button,
  AddressDisplay,
  Status,
  Markdown,
} from "components";
import {  useDaoAddress } from "hooks";
import _ from "lodash";
import { useProposalQuery, useProposalStatusQuery } from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalMetadata } from "ton-vote-sdk";
import { Proposal, ProposalStatus } from "types";
import { getTimeDiff, calculateTonAmount } from "utils";
import { ProposalLoader } from "../ProposalLoader";
import removeMd from "remove-markdown"

import {
  StyledProposal,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
} from "./styles";
import { typography } from "@mui/system";

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
  proposalAddress,
  filterValue,
}: {
  proposalAddress: string;
  filterValue?: ProposalStatus;
}) => {
  const { proposalPage } = useAppNavigation();
  const daoAddress = useDaoAddress();

  const { data: proposal, isLoading } = useProposalQuery(proposalAddress);

  const status = useProposalStatusQuery(proposal?.metadata, proposalAddress);

  const onClick = () => {
    if (proposal?.url) {
      window.open(proposal.url);
    } else {
      proposalPage.root(daoAddress, proposalAddress);
    }
  };

  if (isLoading) {
    return <ProposalLoader />;
  }

  return (
    <StyledProposal onClick={onClick}>
      <StyledFlexColumn alignItems="flex-start">
        <StyledFlexRow justifyContent="space-between">
          <AddressDisplay address={proposal?.metadata?.owner} />
          <Status status={status} />
        </StyledFlexRow>

        <StyledProposalTitle variant="h4">
          {proposal?.metadata?.title}
        </StyledProposalTitle>
        <StyledMarkdown
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {removeMd(proposal?.metadata?.description || "", {
            useImgAltText: true,
          })}
        </StyledMarkdown>

        {status !== ProposalStatus.CLOSED && proposal?.metadata && (
          <Time proposalMetadata={proposal.metadata} status={status} />
        )}

        {!proposal?.hardcoded &&
          status === ProposalStatus.CLOSED &&
          proposal && <Results proposal={proposal} />}
      </StyledFlexColumn>
    </StyledProposal>
  );
};


const StyledMarkdown = styled(Typography)({
  fontWeight: 700,
  fontSize: 17
});

const StyledProposalTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 800,
});

const Results = ({ proposal }: { proposal: Proposal }) => {
  const { proposalResult } = proposal;

  

  return (
    <StyledFlexColumn gap={5}>
      <Result
        title="Yes"
        percent={proposalResult?.yes}
        tonAmount={calculateTonAmount(
          proposalResult?.yes,
          proposalResult?.totalWeight
        )}
      />
      <Result
        title="No"
        percent={proposalResult?.no}
        tonAmount={calculateTonAmount(
          proposalResult?.no,
          proposalResult?.totalWeight
        )}
      />
      <Result
        title="Abstain"
        percent={proposalResult.abstain}
        tonAmount={calculateTonAmount(
          proposalResult?.abstain,
          proposalResult?.totalWeight
        )}
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
