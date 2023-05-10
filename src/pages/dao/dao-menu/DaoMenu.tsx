import { Tabs, Typography } from "@mui/material";
import { VerifiedDao } from "components";
import { getRelaseMode } from "config";
import { MOBILE_WIDTH, routes } from "consts";
import {
  useCurrentRoute,
  useDaoAddressFromQueryParam,
  useIsOwner,
  useMobile,
} from "hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { useNavigate } from "react-router-dom";
import { appNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { ReleaseMode } from "ton-vote-contracts-sdk";
import { Dao } from "types";
import { parseLanguage } from "utils";
import { useDaoPage } from "../hooks";
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
} from "./styles";

export function DaoMenu() {
  const isLoading = useDaoPage().isLoading;
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
  return mobile ? <MobilepMenu /> : <DesktopMenu />;
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
      <DaoSocials />
    </StyledSideMenu>
  );
};

const MobilepMenu = () => {
  return (
    <StyledSideMenu>
      <StyledTop>
        <DaoSocials />
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
  const dao = useDaoPage().data;
  return <StyledLogo src={dao?.daoMetadata?.avatar} />;
};

const DaoTitle = () => {
  const dao = useDaoPage().data;

  return (
    <StyledTitle placement="top" text={parseLanguage(dao?.daoMetadata?.name)} />
  );
};

const DaoDNS = () => {
  const dao = useDaoPage().data;

  if (!dao?.daoMetadata.dns) {
    return null;
  }

  return (
    <StyledDNS>
      <a href={"/"} target="_blank">
        <Typography>{dao?.daoMetadata.dns}</Typography>
      </a>
      <VerifiedDao daoAddress={dao.daoAddress} />
    </StyledDNS>
  );
};

const DaoAddress = () => {
  const dao = useDaoPage().data;
  return <StyledAddressDisplay address={dao?.daoAddress} padding={8} />;
};

const DaoSocials = () => {
  const dao = useDaoPage().data;
  return (
    <StyledSocials
      github={dao?.daoMetadata?.github || "/"}
      telegram={dao?.daoMetadata?.telegram || "/"}
      website={dao?.daoMetadata?.website || "/"}
    />
  );
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

  return (
    <StyledMobileNavigation>
      <Tabs
        centered
        value={currentRoute}
        TabIndicatorProps={{
          style: {
            height: 4,
            borderRadius: 10,
          },
        }}
      >
        {navigations?.map((it, index) => {
          return (
            <StyledTab
              onClick={() => navigate(it.path)}
              key={it.path}
              value={it.route}
              label={it.title}
              {...a11yProps(index)}
            />
          );
        })}
      </Tabs>
    </StyledMobileNavigation>
  );
};

const useNavigationLinks = () => {
  const translations = useDaoPageTranslations();
  const daoAddress = useDaoAddressFromQueryParam();
  const { isDaoOwner, isProposalOnwer, isLoading } = useIsOwner(daoAddress);
  const route = useCurrentRoute();
  if (isLoading) {
    return null;
  }

  const result = [
    {
      title: translations.proposals,
      path: appNavigation.daoPage.root(daoAddress),
      selected: route === routes.space,
      route: routes.space,
    },

    {
      title: translations.about,
      path: appNavigation.daoPage.about(daoAddress),
      selected: route === routes.spaceAbout,
      route: routes.spaceAbout,
    },
    {
      title: translations.newProposal,
      path: appNavigation.daoPage.create(daoAddress),
      selected: route === routes.createProposal,
      owner: true,
      publisher: true,
      route: routes.createProposal,
    },
  ];



  const modified =  _.filter(result, (it) => {
    if (it.owner && !isDaoOwner) {
      return false;
    }
    if ((it.publisher && !isProposalOnwer) || (it.publisher && !isDaoOwner)) {
      return false;
    }
    return true;
  });

  if (getRelaseMode() === ReleaseMode.DEVELOPMENT) {
    modified.push({
      title: translations.settings,
      path: appNavigation.daoPage.settings(daoAddress),
      selected: route === routes.spaceSettings,
      owner: true,
      publisher: false,
      route: routes.createProposal,
    });
  }

  return modified;
};
