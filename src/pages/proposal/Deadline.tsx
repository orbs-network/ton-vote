import { styled } from "@mui/material";
import {
  Container,
  Countdown,
  LoadingContainer,
  TitleContainer,
} from "components";
import { useProposalAddress } from "hooks";
import moment from "moment";
import { useProposalStatusQuery } from "query/queries";
import { ProposalStatus } from "types";
import { useProposalState } from "./hooks";

const handleDate = (endDate?: number) => {
  if (!endDate) return 0;

  return moment.unix(endDate).utc().valueOf();
};

export function Deadline() {
  const proposalAddress = useProposalAddress();
  const proposalMetadata = useProposalState().data?.metadata;

  const proposalStatus = useProposalStatusQuery(
    proposalMetadata,
    proposalAddress
  );

  if (proposalStatus === ProposalStatus.CLOSED || !proposalStatus) return null;

  if (!proposalMetadata) {
    return <LoadingContainer />;
  }
  return (
    <StyledContainer
      title={
        !proposalStatus
          ? ""
          : proposalStatus === ProposalStatus.NOT_STARTED
          ? "Vote starts in"
          : "Time left to vote"
      }
    >
      {proposalStatus === ProposalStatus.NOT_STARTED ? (
        <Countdown date={handleDate(proposalMetadata?.proposalStartTime)} />
      ) : proposalStatus === ProposalStatus.ACTIVE ? (
        <Countdown date={handleDate(proposalMetadata?.proposalEndTime)} />
      ) : null}
    </StyledContainer>
  );
}

const StyledContainer = styled(TitleContainer)({});
