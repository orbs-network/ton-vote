import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useDaoQuery } from "query/queries";
import { useDaoAddress, useProposalAddress } from "hooks";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import AnimateHeight from "react-animate-height";
import { useEffect, useRef, useState } from "react";
import TransparentImg from "assets/tr.png";

import { useProposalPageQuery } from "./query";
import {
  LoadingContainer,
  Markdown,
  Header,
  AddressDisplay,
  Img,
  Container,
  Button,
  ShareButton,
  Status,
  OverflowWithTooltip,
} from "components";
import { parseLanguage } from "utils";
import { useProposalPageStatus } from "./hooks";

const MIN_DESCRIPTION_HEIGHT = 150;

export function ProposalAbout() {
  const [showMore, setShowMore] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const elRef = useRef<any>();

  const { isLoading, data } = useProposalPageQuery(false);

  const metadata = data?.metadata;

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
  const HEIGHT = descriptionHeight > 120 ? 120 : descriptionHeight;

  const description = parseLanguage(metadata?.description);

  return (
    <>
      <StyledContainer>
        <StyledPlaceholder ref={elRef}>
          <StyledMarkdown open={0}>{description}</StyledMarkdown>
        </StyledPlaceholder>
        {ready && (
          <span>
            <StyledFlexColumn gap={0}>
              <StyledFlexColumn alignItems="flex-start" gap={20}>
                <StyledHeader title={parseLanguage(metadata?.title)} />
                <ProposalOwner />
                <AnimateHeight height={showMore ? "auto" : HEIGHT} duration={0}>
                  <StyledMarkdown open={showMore ? 1 : 0}>
                    {description}
                  </StyledMarkdown>
                </AnimateHeight>
              </StyledFlexColumn>

              {showMoreButton && (
                <>
                  <StyledShowMore open={showMore ? 1 : 0}>
                    <StyledShowMoreButton
                      onClick={() => setShowMore(!showMore)}
                      variant="transparent"
                    >
                      <Typography>
                        {showMore ? "Show less" : "Show more"}
                      </Typography>
                    </StyledShowMoreButton>
                  </StyledShowMore>
                </>
              )}
            </StyledFlexColumn>
          </span>
        )}
      </StyledContainer>
    </>
  );
}

const StyledPlaceholder = styled(Box)({
  position: "absolute",
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
  marginTop: 0,
});

const ProposalOwner = () => {
  const daoAddress = useDaoAddress();
  const dao = useDaoQuery(daoAddress);
  const status = useProposalPageStatus();

  return (
    <StyledProposalOwner justifyContent="flex-start">
      <Status status={status} />

      <StyledFlexRow>
        <StyledDaoImg src={dao.data?.daoMetadata.avatar} />
        <StyledFlexRow gap={5} justifyContent="flex-start" style={{ flex: 1 }}>
          <StyledLink
            to={appNavigation.daoPage.root(daoAddress)}
            className="dao-name"
          >
            <OverflowWithTooltip
              text={parseLanguage(dao.data?.daoMetadata.name)}
            />
          </StyledLink>

          <Typography className="by">by</Typography>
          <AddressDisplay
            address={dao?.data?.daoRoles.proposalOwner}
            padding={5}
          />
        </StyledFlexRow>
        <ShareButton url={window.location.href} />
      </StyledFlexRow>
    </StyledProposalOwner>
  );
};

const StyledLink = styled(Link)({
  display: "flex",
});

const StyledDaoImg = styled(Img)({
  width: 30,
  height: 30,
  borderRadius: "50%",
});

const StyledProposalOwner = styled(StyledFlexRow)({
  ".dao-name": {
    p: {
      fontSize: 15,
      fontWeight: 600,
    },
  },
  ".by": {
    fontSize: 15,
    fontWeight: 600,
  },
  ".address-display-btn": {
    p: {
      fontSize: 15,
      fontWeight: 600,
    },
  },
  "*": {
    textDecoration: "unset",
  },
});

const StyledShowMoreButton = styled(Button)(({ theme }) => ({
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
}));


const StyledShowMore = styled(Box)<{ open: number }>(({ open }) => ({
  width: "100%",
  position: "relative",
  boxShadow: open === 1 ? "unset" : "0px -22px 50px 16px #FFFFFF",
  background: "white",
  paddingTop: 20,
  transition:'0.2s all'
}));

const StyledContainer = styled(Container)({
  width: "100%",
  padding: 30,
  position: "relative",
});
