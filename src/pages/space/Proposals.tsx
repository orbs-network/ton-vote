import { Avatar, Box, Chip, styled, Typography } from "@mui/material";
import { Container } from "components";
import { useGetSpaceProposals } from "queries";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Proposal } from "types";
import { getProposalStatus, makeElipsisAddress, timeLeft } from "utils";

function Proposals() {
  const { spaceId } = useParams();

  const { data: proposals } = useGetSpaceProposals(spaceId);

  return (
    <StyledContainer>
      <StyledHeader>
        <Typography variant="h2" className="title">
          Proposals
        </Typography>
      </StyledHeader>
      <StyledFlexColumn gap={20}>
        {proposals?.map((proposal) => {
          return <ProposalComponent proposal={proposal} key={proposal.title} />;
        })}
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const StyledHeader = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  marginTop: 10,
  ".title": {},
});

export { Proposals };

const ProposalComponent = ({ proposal }: { proposal: Proposal }) => {
  const { navigateToProposal } = useAppNavigation();
  const { spaceId } = useParams();
  const ProposalStatus = ({ proposal }: { proposal: Proposal }) => {
    const { text, status } = getProposalStatus(
      proposal.startDate,
      proposal.endDate
    );

    const color = useMemo(() => {
      switch (status) {
        case "finished":
          return "primary";
        case "in-progress":
          return "primary";

        default:
          break;
      }
    }, [status]);

    return <Chip label={text} className="status" color={color} />;
  };

  return (
    <StyledProposal onClick={() => navigateToProposal(spaceId!, proposal.id)}>
      <Container
        title={proposal.title}
        headerChildren={<ProposalStatus proposal={proposal} />}
      >
        <StyledFlexColumn alignItems="flex-start">
          <StyledProposalOwner>
            <Avatar
              src={proposal.ownerAvatar}
              style={{ width: 30, height: 30 }}
            />
            <Typography>
              {makeElipsisAddress(proposal.ownerAddress, 8)}
            </Typography>
          </StyledProposalOwner>
          <Typography className="description">
            {proposal.description}
          </Typography>
          <Typography className="time-left">
            {timeLeft(proposal.endDate)}
          </Typography>
        </StyledFlexColumn>
      </Container>
    </StyledProposal>
  );
};

const StyledProposalOwner = styled(StyledFlexRow)({
  justifyContent: "flex-start",
});

const StyledProposal = styled(Box)({
  width: "100%",
  cursor: "pointer",
  ".description": {
    fontSize: 16,
  },
  ".time-left": {
    fontSize: 14,
  },
});

const StyledContainer = styled(StyledFlexColumn)({
  flex: 1,
  gap: 20,
});
