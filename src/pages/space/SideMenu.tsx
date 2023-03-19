import { Avatar, styled, Typography } from "@mui/material";
import { width } from "@mui/system";
import { Button, Container, Loader } from "components";
import Img from "components/Img";
import { routes } from "consts";
import { useCurrentRoute, useDaoId } from "hooks";
import React from "react";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import { StyledFlexColumn } from "styles";
import { nFormatter } from "utils";
import { useDaoQuery } from "./query";
import Socials from "./Socials";

function SideMenu() {
  const { data: dao, isLoading } = useDaoQuery();

  return (
    <StyledContainer>
      <StyledTop>
        <StyledLogo src={dao?.image} />

        <StyledTitleLoader
          isLoading={isLoading}
          component={<Typography>{dao?.name}</Typography>}
        />
        <StyledMembersLoader
          isLoading={isLoading}
          component={
            <Typography>{nFormatter(dao?.members || 0)} members</Typography>
          }
        />

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
  const daoId = useDaoId();
  const route = useCurrentRoute();

  return (
    <StyledNavigation>
      {navigation.map((navigation, index) => {
        const selected = route === navigation.path;

        return (
          <StyledNavigationLink
            to={navigation.navigate(daoId)}
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
    title: "New proposal",
    navigate: (daoId: string) => appNavigation.spacePage.create(daoId),
    path: routes.createProposal,
  },
  {
    title: "About",
    navigate: (daoId: string) => appNavigation.spacePage.about(daoId),
    path: routes.spaceAbout,
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
