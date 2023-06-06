import { styled, Tabs, Typography } from "@mui/material";
import { VerifiedDao } from "components";
import { routes } from "consts";
import {
  useAppParams,
  useCurrentRoute,
  useDevFeatures,
  useMobile,
  useRole,
} from "hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import _ from "lodash";
import { useDaoQuery } from "query/getters";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { appNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { parseLanguage } from "utils";
import {
  StyledSideMenu,
  StyledLogo,
  StyledSocials,
  StyledNavigation,
  StyledNavigationLoader,
  StyledNavigationLink,
  StyledMobileNavigation,
  StyledTab,
  StyledAddressDisplay,
  StyledDNS,
  StyledLoader,
  StyledTitle,
  StyledTop,
  StyledOuterLink,
} from "./styles";

export function DaoMenu() {
  const { daoAddress } = useAppParams();

  const isLoading = useDaoQuery(daoAddress).isLoading;
  const mobile = useMobile();
  if (isLoading) {
    return (
      <StyledSideMenu>
        <StyledLoader>
          <StyledSkeletonLoader
            style={{ width: 70, height: 70, borderRadius: "50%" }}
          />
          <StyledFlexColumn>
            <StyledSkeletonLoader style={{ width: "50%" }} />
            <StyledSkeletonLoader style={{ width: "80%" }} />
          </StyledFlexColumn>
        </StyledLoader>
      </StyledSideMenu>
    );
  }
  return mobile ? <MobileMenu /> : <DesktopMenu />;
}

const DesktopMenu = () => {
  return (
    <StyledSideMenu>
      <StyledTop>
        <DaoLogo />
        <DaoTitle />
        <StyledFlexColumn>
          <DaoDNS />
          <DaoAddress />
        </StyledFlexColumn>
      </StyledTop>
      <DesktopNavigation />
      <SocialDesktopLinks />
    </StyledSideMenu>
  );
};

const MobileMenu = () => {
  return (
    <StyledSideMenu>
      <StyledTop>
        <StyledFlexRow gap={20} alignItems="flex-start">
          <DaoLogo />
          <StyledFlexColumn alignItems="flex-start" style={{ flex: 1 }}>
            <DaoTitle />
            <StyledFlexColumn alignItems="flex-start">
              <DaoDNS />
              <DaoAddress />
            </StyledFlexColumn>
          </StyledFlexColumn>
        </StyledFlexRow>
      </StyledTop>
      <MobileNavigation />
    </StyledSideMenu>
  );
};

const DaoLogo = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;
  return <StyledLogo src={dao?.daoMetadata?.metadataArgs.avatar} />;
};

const DaoTitle = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;

  return (
    <StyledFlexRow>
      <StyledTitle
        placement="top"
        text={parseLanguage(dao?.daoMetadata?.metadataArgs.name)}
      />
      <VerifiedDao daoAddress={dao?.daoAddress} />
    </StyledFlexRow>
  );
};

const DaoDNS = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;

  if (!dao?.daoMetadata.metadataArgs?.dns) {
    return null;
  }

  return (
    <StyledDNS>
      <Typography>{dao?.daoMetadata.metadataArgs.dns}</Typography>
    </StyledDNS>
  );
};

const DaoAddress = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;
  return <StyledAddressDisplay address={dao?.daoAddress} padding={8} />;
};

const DesktopNavigation = () => {
  const navigations = useNavigationLinks();

  if (!navigations) {
    return (
      <StyledNavigation>
        {_.range(0, 3).map((_, i) => {
          return <StyledNavigationLoader key={i} />;
        })}
      </StyledNavigation>
    );
  }

  return (
    <StyledNavigation>
      {navigations.map((navigation, index) => {
        if (navigation.hide) return null;
        return (
          <StyledNavigationLink
            to={navigation.path}
            key={index}
            selected={!!navigation.selected}
          >
            {navigation.title}
          </StyledNavigationLink>
        );
      })}
    </StyledNavigation>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const MobileNavigation = () => {
  const navigations = useNavigationLinks();
  const currentRoute = useCurrentRoute();
  const navigate = useNavigate();
  const links = useDaoSocials();

  return (
    <StyledMobileNavigation>
      <Tabs
        variant="scrollable"
        value={currentRoute}
        TabIndicatorProps={{
          style: {
            height: 4,
            borderRadius: 10,
          },
        }}
      >
        {navigations?.map((navigation, index) => {
          if (navigation.hide) return null;
          return (
            <StyledTab
              onClick={() => navigate(navigation.path)}
              key={navigation.path}
              value={navigation.route}
              label={navigation.title}
              {...a11yProps(index)}
            />
          );
        })}
        {links.map((link, index) => {
          return (
            <StyledTab
              onClick={() => window.open(link?.value, "_blank")}
              key={link?.value}
              value={link?.value}
              label={link?.title}
              {...a11yProps(index)}
            />
          );
        })}
      </Tabs>
    </StyledMobileNavigation>
  );
};

const useNavigationLinks = () => {
  const showDev = useDevFeatures();
  const { daoAddress } = useAppParams();

  const translations = useDaoPageTranslations();
  const { data, isLoading } = useDaoQuery(daoAddress);
  const { isOwner, isProposalPublisher } = useRole(data?.daoRoles);
  const route = useCurrentRoute();
  if (isLoading) {
    return null;
  }

  return [
    {
      title: translations.proposals,
      path: appNavigation.daoPage.root(daoAddress),
      selected: route === routes.space,
      route: routes.space,
      hide: false,
    },
    {
      title: translations.about,
      path: appNavigation.daoPage.about(daoAddress),
      selected: route === routes.spaceAbout,
      route: routes.spaceAbout,
      hide: false,
    },
    {
      title: translations.newProposal,
      path: appNavigation.daoPage.create(daoAddress),
      selected: route === routes.createProposal,
      hide: !showDev ? true : !isOwner && !isProposalPublisher,
      route: routes.createProposal,
    },
    {
      title: translations.settings,
      path: appNavigation.daoPage.settings(daoAddress),
      selected: route === routes.spaceSettings,
      route: routes.spaceSettings,
      hide: !showDev,
    },
  ];
};

const options = [
  { name: "website", title: "Project website" },
  { name: "github", title: "GitHub" },
  { name: "telegram", title: "Telegram group" },
];
const useDaoSocials = () => {
  const { daoAddress } = useAppParams();

  const { data, isLoading, dataUpdatedAt } = useDaoQuery(daoAddress);

  return useMemo(() => {
    return options
      .map((option) => {
        const metadata = data?.daoMetadata?.metadataArgs as any;
        const value = metadata[option.name];
        if (!value) return null;
        return {
          title: option.title,
          value,
        };
      })
      .filter(Boolean);
  }, [dataUpdatedAt]);
};

const SocialDesktopLinks = () => {
  const links = useDaoSocials();

  if(_.size(links) === 0) return null;

  return (
    <StyleDesktopSocials gap={0}>
      {links.map((link) => {
        return (
          <StyledOuterLink key={link?.value} target="_blank" href={link?.value}>
            {link?.title}
          </StyledOuterLink>
        );
      })}
    </StyleDesktopSocials>
  );
};

const StyleDesktopSocials = styled(StyledFlexColumn)({
  paddingTop: 10,
  marginTop: 10,
  position: "relative",
  "&::after": {
    top: "0px",
    position: "absolute",
    left: "50%",
    transform: "translate(-50%)",
    width: "calc(100% - 40px)",
    height: 2,
    content: "''",
    background: "#EDEDED",
  },
});
