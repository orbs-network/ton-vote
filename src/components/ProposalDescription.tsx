import { Box, Chip, Fade, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { getProposalStatusText } from "utils";
import { useDaoQuery, useProposalStatusQuery } from "query/queries";
import { useDaoAddress, useProposalAddress } from "hooks";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import AnimateHeight from "react-animate-height";
import { lazy, useEffect, useRef, useState } from "react";
import { ProposalMetadata } from "ton-vote-sdk";
import { AddressDisplay } from "./AddressDisplay";
import { Header } from "./Header";
import { Img } from "./Img";
import { LoadingContainer } from "./LoadingContainer";
import { Markdown } from "./Markdown";
import { Button } from "./Button";
import { Container } from "./Container";

const MIN_DESCRIPTION_HEIGHT = 150;

export function ProposalDescription({
  metadata,
  isLoading,
}: {
  metadata?: ProposalMetadata;
  isLoading: boolean;
}) {
  const [showMore, setShowMore] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const elRef = useRef<any>();

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

  return (
    <StyledContainer>
      <StyledPlaceholder ref={elRef}>
        <StyledMarkdown open={0}>{metadata?.description}</StyledMarkdown>
      </StyledPlaceholder>
      {ready && (
        <span>
          <StyledFlexColumn gap={0}>
            <StyledFlexColumn alignItems="flex-start" gap={20}>
              <StyledHeader
                title={metadata?.title || ""}
                component={<StatusChip proposalMetadata={metadata} />}
              />
              <ProposalOwner proposalMetadata={metadata} />
              <AnimateHeight
                height={showMore ? "auto" : descriptionHeight}
                duration={0}
              >
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
        <Typography style={{ margin: "0px 5px 0px 5px" }}>by</Typography>
        {proposalMetadata?.owner && (
          <AddressDisplay address={proposalMetadata?.owner} />
        )}
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
  width: 45,
  height: 45,
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
