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
import { useDaoAddress, useProposalAddress } from "hooks";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import AnimateHeight from "react-animate-height";
import { useEffect, useRef, useState } from "react";
import { ProposalMetadata } from "ton-vote-sdk";

const MIN_DESCRIPTION_HEIGHT = 150;

export function ProposalDescription({
  metadata,
  isLoading,
}: {
  metadata?: ProposalMetadata;
  isLoading: boolean;
}) {
  const [showMore, setShowMore] = useState(false);
  const elRef = useRef<any>();
  const [showMoreButton, setShowMoreButton] = useState(true);

  useEffect(() => {
    if (!elRef?.current?.clientHeight || isLoading) {
      return;
    }
    setShowMoreButton(
      elRef.current.clientHeight < MIN_DESCRIPTION_HEIGHT ? false : true
    );
  }, [elRef?.current?.clientHeight, isLoading]);

  if (isLoading) {
    return <LoadingContainer loaderAmount={4} />;
  }

  return (
    <StyledContainer>
      <StyledFlexColumn gap={0}>
        <StyledFlexColumn alignItems="flex-start" gap={20}>
          <StyledHeader title="Title" />
          <StyledFlexRow>
            <StatusChip proposalMetadata={metadata} />
            <ProposalOwner proposalMetadata={metadata} />
          </StyledFlexRow>
          <AnimateHeight
            height={
              !showMoreButton
                ? "auto"
                : showMore
                ? "auto"
                : MIN_DESCRIPTION_HEIGHT
            }
            duration={0}
          >
            <StyledDescription ref={elRef}>
              This document (“AIP-1.2”) proposes amendments to the Constitution,
              and The Arbitrum Foundation Amended & Restated Memorandum &
              Articles of Association (the “A&R M&A”) and Bylaws (the “Bylaws”)
              This document (“AIP-1.2”) proposes amendments to the Constitution,
              and The Arbitrum Foundation Amended & Restated Memorandum &
              Articles of Association (the “A&R M&A”) and Bylaws (the “Bylaws”)
              This document (“AIP-1.2”) proposes amendments to the Constitution,
              and The Arbitrum Foundation Amended & Restated Memorandum &
              Articles of Association (the “A&R M&A”) and Bylaws (the “Bylaws”)
              This document (“AIP-1.2”) proposes amendments to the Constitution,
              and The Arbitrum Foundation Amended & Restated Memorandum &
              Articles of Association (the “A&R M&A”) and Bylaws (the “Bylaws”)
            </StyledDescription>
          </AnimateHeight>
        </StyledFlexColumn>

        {showMoreButton && (
          <StyledShowMore
            onClick={() => setShowMore(!showMore)}
            variant="transparent"
          >
            <Typography>{showMore ? "Show less" : "Show more"}</Typography>
          </StyledShowMore>
        )}
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const StyledHeader = styled(Header)({
  marginBottom: 0,
});

const StyledDescription = styled(Typography)({
  fontWeight: 600,
  fontSize: 17,
});

const ProposalOwner = ({
  proposalMetadata,
}: {
  proposalMetadata?: ProposalMetadata;
}) => {
  const daoAddress = useDaoAddress();
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

const StatusChip = ({ proposalMetadata }: { proposalMetadata?: ProposalMetadata }) => {
  const proposalAddress = useProposalAddress();

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
  marginTop: 50,
}));

const StyledContainer = styled(Container)({
  width: "100%",
});
