import { styled } from "@mui/material";
import { Container, Countdown } from "components";
import moment from "moment";
import { useProposalInfoQuery } from "queries/queries";
import React from "react";

const handleDate = (endDate?: number | Number) => {
  if (!endDate) return undefined;

  
  return moment.unix(Number(endDate)).utc().valueOf();
};

function DeadlineLayout() {
  const proposalInformation = useProposalInfoQuery().data;

  const endDate = proposalInformation?.endDate;

  return (
    <StyledContainer
      title="Vote end in"
      loading={!proposalInformation}
      loaderAmount={1}
    >
      <Countdown date={handleDate(endDate)} />
    </StyledContainer>
  );
}

export default DeadlineLayout;

const StyledContainer = styled(Container)({});
