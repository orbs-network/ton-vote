import { Chip, Typography, Fade, styled } from "@mui/material";
import { Loader } from "components";
import { useDaoAddress } from "hooks";
import _ from "lodash";
import {
  useProposalInfoQuery,
  useProposalStatusQuery,
  useDaoRolesQuery,
  useProposalStateQuery,
} from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Address } from "ton-core";
import { ProposalMetadata } from "ton-vote-sdk";
import { ProposalResults, ProposalStatus } from "types";
import {
  makeElipsisAddress,
  getTimeDiff,
  nFormatter,
  getProposalStatusText,
  calculateTonAmount,
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
  address,
  filterValue,
}: {
  address: Address;
  filterValue?: ProposalStatus;
}) => {
  const { proposalPage } = useAppNavigation();
  const daoAddress = useDaoAddress();

  const { data: proposalState, isLoading } = useProposalStateQuery(
    address.toString()
  );
  const status = useProposalStatusQuery(address.toString());
  const { data: roles } = useDaoRolesQuery(address.toString());
  const { data: proposalMetadata } = useProposalInfoQuery(address.toString());

  if (filterValue && status && status !== filterValue) return null;

  return (
    <StyledContainer
      isLoading={!status}
      loader={<StyledLoader />}
      component={
        <StyledProposal
          onClick={() => proposalPage.root(daoAddress, address.toString())}
        >
          <StyledProposalContent className="container">
            <StyledFlexColumn alignItems="flex-start">
              <StyledFlexRow justifyContent="space-between">
                <StyledTitleLoader
                  isLoading={isLoading}
                  component={<Typography className="title">Title</Typography>}
                />
                <Chip
                  label={getProposalStatusText(status)}
                  className="status"
                  color="primary"
                />
              </StyledFlexRow>
              <StyledOwnerLoader
                isLoading={isLoading}
                component={
                  <StyledProposalOwner>
                    Owner: {makeElipsisAddress(roles?.owner, 8)}
                  </StyledProposalOwner>
                }
              />

              <StyledDescriptionLoader
                isLoading={isLoading}
                component={<StyledDescription>Description</StyledDescription>}
              />

              {status !== ProposalStatus.CLOSED && proposalMetadata && (
                <Time proposalMetadata={proposalMetadata} status={status} />
              )}

              {status && <Results address={address.toString()} />}
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

const StyledTitleLoader = styled(Loader)({
  maxWidth: "30%",
});
const StyledDescriptionLoader = styled(Loader)({
  maxWidth: "70%",
});

const StyledResultsLoader = styled(Loader)({
  maxWidth: "70%",
});

const StyledOwnerLoader = styled(Loader)({
  maxWidth: "50%",
});

const Results = ({ address }: { address: string }) => {
  const results = useProposalStateQuery(address).data?.results;
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
