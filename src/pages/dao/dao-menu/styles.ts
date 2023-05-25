import { Box, styled, Tab } from "@mui/material";
import { Socials, SideMenu, Img, Container, OverflowWithTooltip, AddressDisplay } from "components";
import { MOBILE_WIDTH } from "consts";
import { StyledSkeletonLoader, StyledFlexColumn, StyledFlexRow } from "styles";
import { Link as RouterLink } from "react-router-dom";

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

export const StyledNavigationLink = styled(RouterLink)<{ selected: boolean }>(
  ({ selected, theme }) => {
    const color = theme.palette.mode === 'light' ?  theme.palette.primary.main : 'white'
    return ({
    width: "100%",
    paddingLeft: 15,
    transition: "0.2s all",
    textDecoration: "unset",
    height: 43,
    display: "flex",
    alignItems: "center",
    color,
    fontWeight: 700,
    borderLeft: selected
      ? `5px solid ${color}`
      : "5px solid transparent",
    "&:hover": {
      background: "rgba(0, 136, 204, 0.05)",
    },
  })
  }
);

export const StyledSocials = styled(Socials)({
  marginTop: 20,
  justifyContent: "center",
  padding: 20,

  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
   margin: 0,
   padding: 0,
   justifyContent: "flex-end",
  },
});

export const StyledSideMenu = styled(SideMenu)({
  padding: 0,
  width: "100%",
  maxWidth: 280,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    maxWidth: "unset",
    paddingBottom: 0,
  },
});

export const StyledLogo = styled(Img)({
  width: 70,
  height: 70,
  borderRadius: "50%",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: 60,
    height: 60,
  },
});


export const StyledMobileNavigation = styled(Box)({
  padding: "0px 10px 0px 10px",
  width: "100%",
  marginTop: 20
});

export const StyledTab = styled(Tab)({
  fontSize: 13,
  padding: "0px 3px",
});

export const StyledAddressDisplay = styled(AddressDisplay)({
  p: {
    fontSize: 15,
    fontWeight: 700,
  },
});

export const StyledTitle = styled(OverflowWithTooltip)(({ theme }) => ({
  color: theme.typography.h2.color,
  fontWeight: 800,
  fontSize: 21,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 18,
  },
}));

export const StyledTop = styled(StyledFlexColumn)({
  padding: 20,
  paddingBottom: 0,
  gap: 25,
  paddingTop: 40,

  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    paddingTop: 10,
    gap: 5,
    alignItems: "flex-start",
  },
});

export const StyledDNS = styled(StyledFlexRow)({
  a: {
    textDecoration: "unset",
  },
  p: {
    fontSize: 16,
    fontWeight: 700,
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    justifyContent: "flex-start",
  },
});

export const StyledLoader = styled(StyledTop)({
  paddingBottom: 20,
});