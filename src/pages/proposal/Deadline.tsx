import { styled } from "@mui/material";
import { Container, Countdown } from "components";
import moment from "moment";
import { useProposalInfoQuery, useVoteTimeline } from "./hooks";
import React from "react";

const handleDate = (endDate?: number | Number) => {
  if (!endDate) return 0;

  return moment.unix(Number(endDate)).utc().valueOf();
};

export function Deadline() {
  const data = useProposalInfoQuery().data;
  const { data: timelineData } = useVoteTimeline();


  if (timelineData?.voteEnded) return null;
  const date = timelineData?.voteStarted ? data?.endTime : data?.startTime;
  return (
    <StyledContainer
      title={
        !data
          ? ""
          : !timelineData?.voteStarted
          ? "Vote starts in"
          : "Time left to vote"
      }
      loading={!data}
      loaderAmount={1}
    >
      <Countdown date={handleDate(date)} />
    </StyledContainer>
  );
}


const StyledContainer = styled(Container)({});
