import { styled } from "@mui/material";
import { Container, Countdown } from "components";
import { useProposalAddress } from "hooks";
import moment from "moment";
import { useProposalInfoQuery, useProposalStatusQuery } from "query/queries";
import React, { useMemo } from "react";
import { ProposalStatus } from "types";

const handleDate = (endDate?: bigint) => {
  if (!endDate) return 0;

  return moment.unix(Number(endDate)).utc().valueOf();
};

export function Deadline() {
  const proposalAddress = useProposalAddress();
  const data = useProposalInfoQuery(proposalAddress).data;
  const proposalStatus = useProposalStatusQuery(proposalAddress, 1_000);

  if (proposalStatus === ProposalStatus.CLOSED || !proposalStatus) return null;
  
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
      {proposalStatus === ProposalStatus.NOT_STARTED ? (
        <Countdown date={handleDate(data?.proposalStartTime)} />
      ) : proposalStatus === ProposalStatus.ACTIVE ? (
        <Countdown date={handleDate(data?.proposalEndTime)} />
      ) : null}
    </StyledContainer>
  );
}

const StyledContainer = styled(Container)({});
