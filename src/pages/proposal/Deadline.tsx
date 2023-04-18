import { styled } from "@mui/material";
import { Countdown, LoadingContainer, TitleContainer } from "components";
import moment from "moment";
import { ProposalMetadata } from "ton-vote-sdk";
import { ProposalStatus } from "types";

const handleDate = (endDate?: number) => {
  if (!endDate) return 0;

  return moment.unix(endDate).utc().valueOf();
};

export function Deadline({
  proposalStatus,
  proposalMetadata,
}: {
  proposalStatus: ProposalStatus;
  proposalMetadata?: ProposalMetadata;
}) {
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
