import { Box, Chip, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { useDaoQuery, useProposalStatusQuery } from "query/queries";
import { useDaoAddress, useProposalAddress, useProposalStatusText } from "hooks";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import AnimateHeight from "react-animate-height";
import {  useEffect, useRef, useState } from "react";
import { ProposalMetadata } from "ton-vote-contracts-sdk";

import { useProposalPageQuery } from "pages/proposal/query";
import { LoadingContainer, Markdown, Header, AddressDisplay, Img, Container, Button } from "components";

const MIN_DESCRIPTION_HEIGHT = 150;

export function ProposalDescription() {
  const [showMore, setShowMore] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const elRef = useRef<any>();


  const {isLoading, data} = useProposalPageQuery(false)

  const metadata = data?.metadata

  useEffect(() => {
    if (elRef.current && !isLoading) {
      setDescriptionHeight(elRef.current.clientHeight);
      setReady(true);
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingContainer loaderAmount={4} />;
  }

  const showMoreButton = descriptionHeight > MIN_DESCRIPTION_HEIGHT;


  const HEIGHT = descriptionHeight > 200 ? 200 : descriptionHeight;

  return (
    <StyledContainer>
      <StyledPlaceholder ref={elRef}>
        <StyledMarkdown open={0}>{metadata?.description}</StyledMarkdown>
      </StyledPlaceholder>
      {ready && (
        <span>
          <StyledFlexColumn gap={0}>
            <StyledFlexColumn alignItems="flex-start" gap={20}>
              <StyledHeader title={metadata?.title || ""} />
              <ProposalOwner />
              <AnimateHeight height={showMore ? "auto" : HEIGHT} duration={0}>
                <StyledMarkdown open={showMore ? 1 : 0}>
                  {metadata?.description}
                </StyledMarkdown>
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
        </span>
      )}
    </StyledContainer>
  );
}

const StyledPlaceholder = styled(Box)({
  position: "fixed",
  visibility: "hidden",
  pointerEvents: "none",
});

const StyledMarkdown = styled(Markdown)<{ open: number }>(({ open }) => ({
  img: {
    display: open ? "block" : "none",
  },
}));

const StyledHeader = styled(Header)({
  marginBottom: 0,
});

const ProposalOwner = () => {
  const daoAddress = useDaoAddress();
    const proposalAddress = useProposalAddress();

  const proposalMetadata  = useProposalPageQuery(false).data?.metadata
  const dao = useDaoQuery(daoAddress);

  return (
    <StyledProposalOwner justifyContent="flex-start">
      <StatusChip proposalMetadata={proposalMetadata} />
      <StyledDaoImg src={dao.data?.daoMetadata.avatar} />
      <StyledFlexRow gap={0} justifyContent="flex-start" style={{ flex: 1 }}>
        <Link to={appNavigation.daoPage.root(daoAddress)} className="dao-name">
          {dao.data?.daoMetadata.name}
        </Link>
        <Typography style={{ margin: "0px 5px 0px 5px" }}>by</Typography>
        <AddressDisplay address={proposalAddress} />
      </StyledFlexRow>
    </StyledProposalOwner>
  );
};

const StatusChip = ({
  proposalMetadata,
}: {
  proposalMetadata?: ProposalMetadata;
}) => {
  const proposalAddress = useProposalAddress();

  const proposalStatus = useProposalStatusQuery(
    proposalMetadata,
    proposalAddress
  );
  const label = useProposalStatusText(proposalStatus);

  return <StyledVoteTimeline label={label} variant="filled" color="primary" />;
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
  width: "100%",
}));

const StyledContainer = styled(Container)({
  width: "100%",
});
