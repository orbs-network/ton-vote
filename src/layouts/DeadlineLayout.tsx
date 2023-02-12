import { styled, Typography } from "@mui/material";
import { Container, Countdown } from "components";
import { useIsVoteEnded } from "hooks";
import moment from "moment";
import { useProposalInfoQuery } from "queries";
import React from "react";

const handleDate = (endDate?: number | Number) => {
  if (!endDate) return undefined;

  return moment.unix(Number(endDate)).utc().valueOf();
};

function DeadlineLayout() {
  const proposalInformation = useProposalInfoQuery().data;
  const voteEnded = useIsVoteEnded();

  const endDate = proposalInformation?.endTime;

  return (
    <StyledContainer
      title="Time left to vote"
      loading={!proposalInformation}
      loaderAmount={1}
    >
      {voteEnded ? (
        <Typography style={{ fontWeight: 500 }}>Vote ended</Typography>
      ) : (
        <Countdown date={handleDate(endDate)} />
      )}
    </StyledContainer>
  );
}

export default DeadlineLayout;

const StyledContainer = styled(Container)({});
