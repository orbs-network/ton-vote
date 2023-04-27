import { styled } from "@mui/material";
import { Countdown, LoadingContainer, TitleContainer } from "components";
import moment from "moment";
import { ProposalStatus } from "types";
import { useProposalPageStatus } from "./hooks";
import { useProposalPageQuery } from "./query";

const handleDate = (endDate?: number) => {
  if (!endDate) return 0;

  return moment.unix(endDate).utc().valueOf();
};

export function Deadline() {
  const { data } = useProposalPageQuery();
  const proposalStatus = useProposalPageStatus();

  const proposalMetadata = data?.metadata;

  if (!proposalMetadata) {
    return <LoadingContainer />;
  }
  return (
    <TitleContainer
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
    </TitleContainer>
  );
}
