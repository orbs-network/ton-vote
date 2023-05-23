import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useDaoAddressFromQueryParam, useMobile, useProposalAddress } from "hooks";
import { Link } from "react-router-dom";
import { appNavigation } from "router/navigation";
import AnimateHeight from "react-animate-height";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { makeElipsisAddress, parseLanguage } from "utils";
import { useProposalPageStatus } from "./hooks";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { MOBILE_WIDTH } from "consts";
import { useDaoFromQueryParam, useProposalPageQuery } from "query/getters";
import { mock } from "mock/mock";

const MIN_DESCRIPTION_HEIGHT = 200;

export const ProposalAbout = () => {
  const { isLoading } = useProposalPageQuery(false);
  const mobile = useMobile();

  if (isLoading) {
    return <LoadingContainer loaderAmount={4} />;
  }

  return (
    <StyledContainer>
      {mobile ? <MobileAbout /> : <DesktopAbout />}
    </StyledContainer>
  );
};

function DesktopAbout() {
  return (
    <StyledFlexColumn alignItems="flex-start" gap={20}>
      <ProposalHeader />
      <StyledProposalOwner justifyContent="flex-start">
        <ProposalStatus />
        <DaoInfo />
        <ByProposalOwner />
        <StyledShareButton url={window.location.href} />
      </StyledProposalOwner>
      <Description />
    </StyledFlexColumn>
  );
}

function MobileAbout() {
  return (
    <StyledFlexColumn alignItems="flex-start" gap={20}>
      <ProposalHeader />
      <StyledProposalOwner justifyContent="flex-start">
        <StyledFlexRow justifyContent="flex-start">
          <ProposalStatus />
          <DaoInfo />
        </StyledFlexRow>
        <StyledFlexRow>
          <ByProposalOwner />
          <StyledShareButton url={window.location.href} />
        </StyledFlexRow>
      </StyledProposalOwner>
      <Description />
    </StyledFlexColumn>
  );
}

const ProposalHeader = () => {
  const proposalAddress = useProposalAddress();
  const data = useProposalPageQuery(false).data;

  const mockPrefix = mock.isMockProposal(proposalAddress)  ? ' (Mock)' : '';
  
  const title = parseLanguage(data?.metadata?.title);

  return (
    <>
      <StyledHeader title={`${title}${mockPrefix}`} />
    </>
  );
};

const ShowMoreButton = ({
  onClick,
  showMore,
}: {
  onClick: (value: boolean) => void;
  showMore: boolean;
}) => {
  const translations = useProposalPageTranslations();

  return (
    <StyledShowMore open={showMore ? 1 : 0}>
      <StyledShowMoreButton
        onClick={() => onClick(!showMore)}
        variant="transparent"
      >
        <Typography>
          {showMore ? translations.showLess : translations.showMore}
        </Typography>
      </StyledShowMoreButton>
    </StyledShowMore>
  );
};

const Description = () => {
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const elRef = useRef<any>();
  const { data, isLoading } = useProposalPageQuery(false);
  const [showMore, setShowMore] = useState(false);

  useLayoutEffect(() => {
    if (elRef.current) {
      setDescriptionHeight(elRef.current.offsetHeight);
    }
  }, [data?.metadata?.description]);
  const description = parseLanguage(data?.metadata?.description);

  const showMoreButton = descriptionHeight > MIN_DESCRIPTION_HEIGHT;

  const HEIGHT =
    descriptionHeight > MIN_DESCRIPTION_HEIGHT
      ? MIN_DESCRIPTION_HEIGHT
      : descriptionHeight;

  return (
    <StyledDescription>
      <StyledPlaceholder ref={elRef}>
        <StyledMarkdown open={0}>{description}</StyledMarkdown>
      </StyledPlaceholder>
      <AnimateHeight height={showMore ? "auto" : HEIGHT} duration={0}>
        <StyledMarkdown open={showMore ? 1 : 0}>{description}</StyledMarkdown>
      </AnimateHeight>
      {showMoreButton && (
        <ShowMoreButton showMore={showMore} onClick={setShowMore} />
      )}
    </StyledDescription>
  );
};

const StyledDescription = styled(Box)({
  position: "relative",
});

const StyledPlaceholder = styled("span")({
  position: "absolute",
  visibility: "hidden",
  pointerEvents: "none",
  height: "auto",
});

const StyledMarkdown = styled(Markdown)<{ open: number }>(({ open }) => ({
  img: {
    display: open ? "block" : "none",
  },
  ul: {
    paddingLeft: 20,
  },
  ol: {
    paddingLeft: 20,
  },
}));

const StyledHeader = styled(Header)({
  marginBottom: 0,
  marginTop: 0,
});

const ProposalStatus = () => {
  const status = useProposalPageStatus();

  return <Status status={status} />;
};

const StyledShareButton = styled(ShareButton)({
  marginLeft: "auto",
});

const DaoInfo = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  const daoMetadata = useDaoFromQueryParam().data?.daoMetadata;

  return (
    <StyledFlexRow style={{ width: "auto" }}>
      <StyledDaoImg src={daoMetadata?.metadataArgs.avatar} />
      <StyledLink
        to={appNavigation.daoPage.root(daoAddress)}
        className="dao-name"
      >
        <OverflowWithTooltip text={parseLanguage(daoMetadata?.metadataArgs.name)} />
      </StyledLink>
    </StyledFlexRow>
  );
};

const ByProposalOwner = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  const daoRoles = useDaoFromQueryParam().data?.daoRoles;
  if (!daoRoles?.proposalOwner) {
    return null;
  }
  return (
    <AddressDisplay
      displayText={`by ${makeElipsisAddress(daoRoles?.proposalOwner, 5)}`}
      address={daoRoles?.proposalOwner || ""}
      padding={5}
    />
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
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    flexDirection: "column",
    alignItems: "flex-start",
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
  transition: "0.2s all",
}));

const StyledContainer = styled(Container)({
  width: "100%",
  padding: 30,
  position: "relative",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    padding: 20,
  },
});
