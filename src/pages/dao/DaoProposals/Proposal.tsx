import { Chip, Typography, Fade } from "@mui/material";
import { useDaoAddress } from "hooks";
import { useProposalMetadataQuery, useProposalInfoQuery } from "query";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Address } from "ton-core";
import { ProposalInfo, ProposalStatus } from "types";
import {
  getProposalStatus,
  makeElipsisAddress,
  getTimeDiff,
  nFormatter,
  getProposalStatusText,
} from "utils";
import {
  StyledDescription,
  StyledProposal,
  StyledProposalContent,
  StyledProposalOwner,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
} from "./styles";

const Time = ({
  proposalInfo,
  status,
}: {
  proposalInfo: ProposalInfo;
  status: ProposalStatus | null;
}) => {
  if (!status) return null;

  if (status === ProposalStatus.NOT_STARTED) {
    return (
      <Typography className="time-left">
        Start in {getTimeDiff(proposalInfo.proposalStartTime)}
      </Typography>
    );
  }
  return (
    <Typography className="time-left">
      {getTimeDiff(proposalInfo.proposalEndTime)} Left
    </Typography>
  );
};

export const ProposalComponent = ({ address }: { address: Address }) => {
  const { proposalPage } = useAppNavigation();
  const daoAddress = useDaoAddress();

  const { data: proposalMetadata } = useProposalMetadataQuery(
    address.toString()
  );
  const { data: proposalInfo, error } = useProposalInfoQuery(address.toString());
  
  const status = getProposalStatus(
    Number(proposalInfo?.proposalStartTime),
    Number(proposalInfo?.proposalEndTime)
  );

  return (
    <Fade in={true}>
      <StyledProposal
        onClick={() => proposalPage.root(daoAddress, address.toString())}
      >
        <StyledProposalContent className="container">
          <StyledFlexRow justifyContent="space-between">
            <Typography className="title">{proposalMetadata?.title}</Typography>
            <Chip
              label={getProposalStatusText(status)}
              className="status"
              color="primary"
            />
          </StyledFlexRow>
          <StyledFlexColumn alignItems="flex-start">
            <StyledProposalOwner>
              Owner: {makeElipsisAddress(proposalMetadata?.owner, 8)}
            </StyledProposalOwner>
            <StyledDescription>
              {proposalMetadata?.description}
            </StyledDescription>
            {proposalInfo && (
              <Time proposalInfo={proposalInfo} status={status} />
            )}
            <Results status={status} />
          </StyledFlexColumn>
        </StyledProposalContent>
      </StyledProposal>
    </Fade>
  );
};

const Results = ({ status }: { status: ProposalStatus | null }) => {
  if (status !== ProposalStatus.CLOSED) return null;
  return (
    <StyledFlexColumn gap={5}>
      <Result title="Yes" percent={10} tonAmount={20000} />
      <Result title="No" percent={30} tonAmount={20000} />
      <Result title="Abstain" percent={60} tonAmount={20000} />
    </StyledFlexColumn>
  );
};

const Result = ({
  title,
  percent,
  tonAmount,
}: {
  title: string;
  percent: number;
  tonAmount: number;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <Typography style={{ fontWeight: 700 }}>{title}</Typography>
          <Typography fontSize={13}>{nFormatter(tonAmount, 2)} TON</Typography>
        </StyledFlexRow>
        <Typography style={{ fontWeight: 700 }}>{percent}%</Typography>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};
