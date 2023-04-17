import { Button, Container, Header, Img, LoadingContainer } from "components";
import { Box, Chip, Fade, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import {
  getProposalStatusText,
  getTonScanContractUrl,
  makeElipsisAddress,
} from "utils";
import { useDaoQuery, useProposalStatusQuery } from "query/queries";
import { useProposalState } from "./hooks";
import { useDaoAddress, useProposalAddress } from "hooks";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import AnimateHeight from "react-animate-height";
import { useState } from "react";

export function Hero() {
  const isLoading = useProposalState().isLoading;
  const [showMore, setShowMore] = useState(false);

  if (isLoading) {
    return <LoadingContainer loaderAmount={4} />;
  }

  return (
    <StyledContainer>
      <StyledFlexColumn gap={0}>
        <StyledFlexColumn alignItems="flex-start" gap={20}>
          <StyledHeader title="Title" />
          <StyledFlexRow>
            <StatusChip />
            <ProposalOwner />
          </StyledFlexRow>
          <StyledDescription>
            This document (“AIP-1.2”) proposes amendments to the Constitution,
            and The Arbitrum Foundation Amended & Restated Memorandum & Articles
            of Association (the “A&R M&A”) and Bylaws (the “Bylaws”) to (1)
            remove references to AIP-1, and (2) make other changes reflecting
            feedback from the community.
          </StyledDescription>
        </StyledFlexColumn>
        <AnimateHeight height={showMore ? "auto" : 0} duration={200}>
          <StyledDescription>
            Motivation: AIP-1 set out critical aspects of governance and
            included key governance documents for the ArbitrumDAO, and The
            Arbitrum Foundation which referenced AIP-1 throughout: the
            ArbitrumDAO Constitution (the “Constitution”), the Bylaws and the
            A&R M&A. However, after vigorous community debate, AIP-1 did not
            pass.
          </StyledDescription>
        </AnimateHeight>
        <StyledShowMore
          onClick={() => setShowMore(!showMore)}
          variant="transparent"
        >
          <Typography>{showMore ? "Show less" : "Show more"}</Typography>
        </StyledShowMore>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const StyledHeader = styled(Header)({
  marginBottom:0
})


const StyledDescription = styled(Typography)({
  fontWeight: 600,
  fontSize: 17,
  
})

const ProposalOwner = () => {
  const daoAddress = useDaoAddress();
  const proposalMetadata = useProposalState().data?.metadata;
  const dao = useDaoQuery(daoAddress);

  return (
    <StyledProposalOwner justifyContent="flex-start">
      <StyledDaoImg src={dao.data?.daoMetadata.avatar} />
      <StyledFlexRow gap={0} justifyContent="flex-start" style={{ flex: 1 }}>
        <Link to={appNavigation.daoPage.root(daoAddress)} className="dao-name">
          {dao.data?.daoMetadata.name}
        </Link>
        {proposalMetadata?.owner && (
          <StyledLink
            href={getTonScanContractUrl(proposalMetadata?.owner)}
            target="_blank"
          >
            by {makeElipsisAddress(proposalMetadata?.owner, 6)}
          </StyledLink>
        )}
      </StyledFlexRow>
    </StyledProposalOwner>
  );
};

const StatusChip = () => {
  const proposalAddress = useProposalAddress();
  const proposalMetadata = useProposalState().data?.metadata;

  const proposalStatus = useProposalStatusQuery(
    proposalMetadata,
    proposalAddress
  );

  return (
    <StyledVoteTimeline
      label={getProposalStatusText(proposalStatus)}
      variant="filled"
      color="primary"
    />
  );
};

const StyledLink = styled("a")({
  width: "unset",
  marginLeft: 5,
});

const StyledDaoImg = styled(Img)({
  width: 30,
  height: 30,
  borderRadius: "50%",
});

const StyledProposalOwner = styled(StyledFlexRow)({
  "*": {
    textDecoration: "unset",
    color: "unset",
    fontWeight: 600,
  },
  a: {
    ...textOverflow,
  },
  ".dao-name": {
    maxWidth: 200,
  },
});

const StyledVoteTimeline = styled(Chip)({
  fontWeight: 700,
  fontSize: 12,
});

const StyledShowMore = styled(Button)(({ theme }) => ({
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 20,
}));

const StyledContainer = styled(Container)({
  width: "100%",
});
