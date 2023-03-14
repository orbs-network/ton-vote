import { Avatar, styled, Typography } from "@mui/material";
import { Button, Container } from "components";
import { routes } from "consts";
import { useCurrentRoute, useSpaceId } from "hooks";
import React from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import { appNavigation } from "router";
import { StyledFlexColumn } from "styles";
import { nFormatter } from "utils";
import { useGetSpaceQuery } from "./query";
import Socials from "./Socials";

function SideMenu() {
  const { spaceId } = useParams();

  const { data: space } = useGetSpaceQuery(spaceId);

  return (
    <StyledContainer>
      <StyledTop>
        <StyledLogo src={space?.image} />
        <StyledTitle>{space?.name}</StyledTitle>
        <Typography>{nFormatter(space?.members || 0)} members</Typography>
        <StyledJoin>Join</StyledJoin>
      </StyledTop>
      <Navigation />
      <StyledSocials github="/" twitter="/" />
    </StyledContainer>
  );
}


const StyledTop = styled(StyledFlexColumn)({
    padding: 20,
    paddingBottom: 0
})

const Navigation = () => {
  const spaceId = useSpaceId();
  const route = useCurrentRoute();

  return (
    <StyledNavigation>
      {navigation.map((navigation, index) => {
        const selected = route === navigation.path;

        return (
          <StyledNavigationLink
            to={navigation.navigate(spaceId)}
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
    navigate: (spaceId: string) => appNavigation.spacePage.root(spaceId),
    path: routes.space,
  },
  {
    title: "New proposal",
    navigate: (spaceId: string) => appNavigation.spacePage.create(spaceId),
    path: routes.createProposal,
  },
  {
    title: "About",
    navigate: (spaceId: string) => appNavigation.spacePage.about(spaceId),
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
    width:'100%',
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
  padding: 20
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
  padding: 0
});

const StyledLogo = styled(Avatar)({
  width: 90,
  height: 90,
});
