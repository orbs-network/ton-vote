import { Chip, Typography, Fade, styled } from "@mui/material";
import { Loader } from "components";
import { useDaoAddress } from "hooks";
import {
  useProposalMetadataQuery,
  useProposalInfoQuery,
  useProposalStatusQuery,
} from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Address } from "ton-core";
import { ProposalMetadata } from "ton-vote-npm";
import { ProposalStatus } from "types";
import {
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
  proposalInfo: ProposalMetadata;
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

  const { data: proposalMetadata, isLoading } = useProposalMetadataQuery(
    address.toString()
  );
  const { data: proposalInfo } = useProposalInfoQuery(address.toString());
  const status = useProposalStatusQuery(address.toString());

  return (
    <Fade in={true}>
      <StyledProposal
        onClick={() => proposalPage.root(daoAddress, address.toString())}
      >
        <StyledProposalContent className="container">
          <StyledFlexColumn alignItems="flex-start">
            <StyledFlexRow justifyContent="space-between">
              <StyledTitleLoader
                isLoading={isLoading}
                component={
                  <Typography className="title">
                    {proposalMetadata?.title}
                  </Typography>
                }
              />
              <StyledStatus
                isLoading={!status}
                component={
                  <Chip
                    label={getProposalStatusText(status)}
                    className="status"
                    color="primary"
                  />
                }
              />
            </StyledFlexRow>
            <StyledOwnerLoader
              isLoading={isLoading}
              component={
                <StyledProposalOwner>
                  Owner: {makeElipsisAddress(proposalMetadata?.owner, 8)}
                </StyledProposalOwner>
              }
            />

            <StyledDescriptionLoader
              isLoading={isLoading}
              component={
                <StyledDescription>
                  {proposalMetadata?.description}
                </StyledDescription>
              }
            />

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

const StyledTitleLoader = styled(Loader)({
  maxWidth: "30%",
});
const StyledDescriptionLoader = styled(Loader)({
  maxWidth: "70%",
});

const StyledOwnerLoader = styled(Loader)({
  maxWidth: "50%",
});

const StyledStatus = styled(Loader)({
  width: 80,
  height: 30,
  borderRadius: 20,
});

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
