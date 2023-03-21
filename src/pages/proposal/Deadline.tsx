import { styled } from "@mui/material";
import { Container, Countdown } from "components";
import moment from "moment";
import { useProposalInfoQuery, useProposalStatus } from "./hooks";
import React from "react";
import { ProposalStatus } from "types";

const handleDate = (endDate?: number | Number) => {
  if (!endDate) return 0;

  return moment.unix(Number(endDate)).utc().valueOf();
};

export function Deadline() {
  const data = useProposalInfoQuery().data;
  const proposalStatus = useProposalStatus();

  if (proposalStatus === ProposalStatus.CLOSED || !proposalStatus) return null;
  const date =
    proposalStatus === ProposalStatus.ACTIVE ? data?.endTime : data?.startTime;
  return (
    <StyledContainer
      title={
        !proposalStatus
          ? ""
          : proposalStatus === ProposalStatus.NOT_STARTED
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
