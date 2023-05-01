import { styled, Typography } from "@mui/material";
import {
  Img,
  SideMenu,
  AddressDisplay,
  Socials,
  OverflowWithTooltip,
  VerifiedDao,
} from "components";
import { routes } from "consts";
import { useCurrentRoute, useDaoAddress, useIsOwner } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { appNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { parseLanguage } from "utils";

export function DaoMenu() {
  const daoAddresses = useDaoAddress();
  const { data: dao, isLoading } = useDaoQuery(daoAddresses);

  if (isLoading) {
    return (
      <StyledContainer>
        <StyledLoader>
          <StyledSkeletonLoader
            style={{ width: 70, height: 70, borderRadius: "50%" }}
          />
          <StyledFlexColumn>
            <StyledSkeletonLoader style={{ width: "50%" }} />
            <StyledSkeletonLoader style={{ width: "80%" }} />
          </StyledFlexColumn>
        </StyledLoader>
      </StyledContainer>
    );
  }
  return (
    <StyledContainer>
      <StyledTop>
        <StyledFlexColumn gap={30}>
          <StyledLogo src={dao?.daoMetadata?.avatar} />
          <StyledTitle
            placement="top"
            text={parseLanguage(dao?.daoMetadata?.name)}
          />
          <StyledFlexColumn>
            {dao?.daoMetadata.dns && (
              <StyledDNS>
                <a href={"/"} target="_blank">
                  <Typography>{dao?.daoMetadata.dns}</Typography>
                </a>
                <VerifiedDao daoAddress={dao.daoAddress} />
              </StyledDNS>
            )}
            <StyledAddressDisplay address={dao?.daoAddress} padding={8} />
          </StyledFlexColumn>
        </StyledFlexColumn>
      </StyledTop>
      <Navigation />
      <StyledSocials
        github={dao?.daoMetadata?.github || "/"}
        telegram={dao?.daoMetadata?.telegram || "/"}
        website={dao?.daoMetadata?.website || "/"}
      />
    </StyledContainer>
  );
}

const StyledDNS = styled(StyledFlexRow)({
  a: {
    textDecoration:'unset'
  },
  p: {
    fontSize: 16,
    fontWeight: 700,
  },
});

const StyledAddressDisplay = styled(AddressDisplay)({
  p: {
    fontSize: 15,
    fontWeight: 700,
  },
});

const StyledTitle = styled(OverflowWithTooltip)(({ theme }) => ({
  color: theme.typography.h2.color,
  fontWeight: 800,
  fontSize: 21,
}));

const StyledTop = styled(StyledFlexColumn)({
  padding: 20,
  paddingBottom: 0,
  gap: 25,
  paddingTop: 40
});

const StyledLoader = styled(StyledTop)({
  paddingBottom: 20,
});

const Navigation = () => {
  const daoAddress = useDaoAddress();
  const route = useCurrentRoute();
  const { isDaoOwner, isProposalOnwer, isLoading } = useIsOwner(daoAddress);

  const isOwner = isDaoOwner || isProposalOnwer;

  const navigation = useNavigationLinks();

  if (isLoading) {
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
      {navigation.map((navigation, index) => {
        if (navigation.onlyOwner && !isOwner) return null;
        const selected = route === navigation.path;

        return (
          <StyledNavigationLink
            to={navigation.navigate(daoAddress)}
            key={index}
            selected={selected}
          >
            {navigation.title}
          </StyledNavigationLink>
        );
      })}
    </StyledNavigation>
  );
};

const useNavigationLinks = () => {
  const {t} = useTranslation()
  return [
    {
      title: t("proposals"),
      navigate: (daoId: string) => appNavigation.daoPage.root(daoId),
      path: routes.space,
    },

    {
      title: t("about"),
      navigate: (daoId: string) => appNavigation.daoPage.about(daoId),
      path: routes.spaceAbout,
    },
    {
      title: t("newProposal"),
      navigate: (daoId: string) => appNavigation.daoPage.create(daoId),
      path: routes.createProposal,
      onlyOwner: true,
    },
  ];
};

const StyledNavigationLoader = styled(StyledSkeletonLoader)({
  width: "calc(100% - 30px)",
  height: 30,
  marginBottom: 10,
});

const StyledNavigation = styled(StyledFlexColumn)({
  gap: 0,
  alignItems: "center",
  marginTop: 40,
  p: {
    fontWeight: 600,
  },
});

const StyledNavigationLink = styled(RouterLink)<{ selected: boolean }>(
  ({ selected, theme }) => ({
    width: "100%",
    paddingLeft: 15,
    transition: "0.2s all",
    textDecoration: "unset",
    height: 43,
    display: "flex",
    alignItems: "center",
    color: theme.palette.primary.main,
    fontWeight: 700,
    borderLeft: selected
      ? `5px solid ${theme.palette.primary.main}`
      : "5px solid transparent",
    "&:hover": {
      background: "rgba(0, 136, 204, 0.05)",
    },
  })
);

const StyledSocials = styled(Socials)({
  marginTop: 20,
  justifyContent: "center",
  padding: 20,
});

const StyledContainer = styled(SideMenu)({
  padding: 0,
  maxWidth: 280,
  width:'100%',
});

const StyledLogo = styled(Img)({
  width: 70,
  height: 70,
  borderRadius: "50%",
});
