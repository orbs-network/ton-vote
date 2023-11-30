import { styled } from "@mui/material";
import { SideMenu } from "components";
import { MOBILE_WIDTH } from "consts";
import React from "react";
import { StyledFlexColumn, StyledSkeletonLoader } from "styles";
import { useNavigationLinks, useSocials } from "./hooks";
import { Link as RouterLink } from "react-router-dom";
import { Address, DNS, Logo, Title } from "./Components";
import _ from "lodash";
import { useAppParams } from "hooks/hooks";
import { useDaoQuery } from "query/getters";


const MenuLoader = () => {
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
};


export const DesktopMenu = () => {
  const { daoAddress } = useAppParams();

  const isLoading = useDaoQuery(daoAddress).isLoading;

  if (isLoading) {
    return <MenuLoader />;
  }
    return (
      <StyledSideMenu>
        <StyledTop>
          <Logo />
          <Title />
          <StyledFlexColumn>
            <DNS />
            <Address />
          </StyledFlexColumn>
        </StyledTop>
        <DesktopNavigation />
        <SocialDesktopLinks />
      </StyledSideMenu>
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

const SocialDesktopLinks = () => {
  const socials = useSocials();

  if (_.size(socials) === 0) return null;

  return (
    <StyleDesktopSocials gap={0}>
      {socials.map((link) => {
        return (
          <StyledOuterLink key={link?.value} target="_blank" href={link?.value}>
            {link?.title}
          </StyledOuterLink>
        );
      })}
    </StyleDesktopSocials>
  );
};

export const StyledOuterLink = styled("a")(({ theme }) => {
  const color =
    theme.palette.mode === "light" ? theme.palette.primary.main : "white";
  return {
    width: "100%",
    paddingLeft: 15,
    transition: "0.2s all",
    textDecoration: "unset",
    height: 43,
    display: "flex",
    alignItems: "center",
    color: color,
    fontWeight: 700,
    borderLeft: "5px solid transparent",
    "&:hover": {
      background: "rgba(0, 136, 204, 0.05)",
    },
  };
});

export const StyleDesktopSocials = styled(StyledFlexColumn)({
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

export const StyledSideMenu = styled(SideMenu)({
  padding: 0,
  width: "100%",
  maxWidth: 280,
  paddingBottom: 20,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    maxWidth: "unset",
    paddingBottom: 0,
  },
});

export const StyledTop = styled(StyledFlexColumn)({
  padding: 20,
  paddingBottom: 0,
  gap: 25,
  paddingTop: 40,
});

export const StyledNavigationLink = styled(RouterLink)<{ selected: boolean }>(
  ({ selected, theme }) => {
    const color =
      theme.palette.mode === "light" ? theme.palette.primary.main : "white";
    return {
      width: "100%",
      paddingLeft: 15,
      transition: "0.2s all",
      textDecoration: "unset",
      height: 43,
      display: "flex",
      alignItems: "center",
      color,
      fontWeight: 700,
      borderLeft: selected ? `5px solid ${color}` : "5px solid transparent",
      "&:hover": {
        background: "rgba(0, 136, 204, 0.05)",
      },
    };
  }
);

export const StyledNavigationLoader = styled(StyledSkeletonLoader)({
  width: "calc(100% - 30px)",
  height: 30,
  marginBottom: 10,
});

export const StyledNavigation = styled(StyledFlexColumn)({
  gap: 0,
  alignItems: "center",
  marginTop: 40,
  p: {
    fontWeight: 600,
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    flexDirection: "row",
    gap: 10,
  },
});
const StyledLoader = styled(StyledTop)({
  paddingBottom: 20,
});
