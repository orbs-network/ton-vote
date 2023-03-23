import { styled } from "@mui/material";
import { Container, Countdown } from "components";
import { useProposalAddress } from "hooks";
import moment from "moment";
import { useProposalInfoQuery, useProposalStatusQuery } from "query";
import React from "react";
import { ProposalStatus } from "types";

const handleDate = (endDate?: bigint) => {
  if (!endDate) return 0;

  return moment.unix(Number(endDate)).utc().valueOf();
};

export function Deadline() {
  const proposalAddress = useProposalAddress()
  const data = useProposalInfoQuery(proposalAddress).data;
  const proposalStatus = useProposalStatusQuery(proposalAddress);

  if (proposalStatus === ProposalStatus.CLOSED || !proposalStatus) return null;
  const date =
    proposalStatus === ProposalStatus.ACTIVE ? data?.proposalEndTime : data?.proposalStartTime;
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
