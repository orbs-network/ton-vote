import { styled, Typography } from "@mui/material";
import { Button, Container, Loader, Img } from "components";
import { routes } from "consts";
import { useCurrentRoute, useDaoAddress, useIsOwner } from "hooks";
import { useDaoMetadataQuery, useDaoRolesQuery } from "query";
import React from "react";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import { StyledFlexColumn } from "styles";
import Socials from "./Socials";

function SideMenu() {
  const daoAddresses = useDaoAddress();
  const { data: dao, isLoading } = useDaoMetadataQuery(daoAddresses);

  return (
    <StyledContainer>
      <StyledTop>
        <StyledLogo src={dao?.avatar} />

        <StyledTitleLoader isLoading={isLoading} component={dao?.name} />

        <StyledJoin disabled={isLoading}>Join</StyledJoin>
      </StyledTop>
      <Navigation />
      <StyledSocials github="/" twitter="/" />
    </StyledContainer>
  );
}

const StyledMembersLoader = styled(Loader)({
  width: "50%",
  height: 20,
  marginTop: 5,
});

const StyledTitleLoader = styled(Loader)({
  width: "70%",
  height: 20,
  marginTop: 5,
});

const StyledTop = styled(StyledFlexColumn)({
  padding: 20,
  paddingBottom: 0,
});

const Navigation = () => {
  const daoAddress = useDaoAddress();
  const route = useCurrentRoute();
  const { isDaoOwner, isProposalOnwer } = useIsOwner(daoAddress);

  const isOwner = isDaoOwner || isProposalOnwer;
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
            <Typography>{navigation.title}</Typography>
          </StyledNavigationLink>
        );
      })}
    </StyledNavigation>
  );
};

const navigation = [
  {
    title: "Proposals",
    navigate: (daoId: string) => appNavigation.spacePage.root(daoId),
    path: routes.space,
  },

  {
    title: "About",
    navigate: (daoId: string) => appNavigation.spacePage.about(daoId),
    path: routes.spaceAbout,
  },
  {
    title: "New proposal",
    navigate: (daoId: string) => appNavigation.spacePage.create(daoId),
    path: routes.createProposal,
    onlyOwner: true,
  },
];

const StyledNavigation = styled(StyledFlexColumn)({
  gap: 0,
  alignItems: "flex-start",
  marginTop: 40,
  p: {
    fontWeight: 600,
  },
});

const StyledNavigationLink = styled(Link)<{ selected: boolean }>(
  ({ selected, theme }) => ({
    width: "100%",
    paddingLeft: 15,
    transition: "0.2s all",
    textDecoration: "unset",
    height: 43,
    display: "flex",
    alignItems: "center",
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
  justifyContent: "flex-start",
  padding: 20,
});

export { SideMenu };

const StyledJoin = styled(Button)({
  minWidth: 120,
});

const StyledTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 800,
});

const StyledContainer = styled(Container)({
  position: "sticky",
  top: 90,
  width: 320,
  padding: 0,
});

const StyledLogo = styled(Img)({
  width: 90,
  height: 90,
  borderRadius: "50%",
});
