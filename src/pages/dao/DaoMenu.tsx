import { styled, Typography } from "@mui/material";
import { Button, Loader, Img, SideMenu } from "components";
import { routes } from "consts";
import { useCurrentRoute, useDaoAddress, useIsOwner } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import { StyledFlexColumn, StyledSkeletonLoader } from "styles";
import Socials from "./Socials";

export function DaoMenu() {
  const daoAddresses = useDaoAddress();
  const { data: dao, isLoading } = useDaoQuery(daoAddresses);

  return (
    <StyledContainer>
      <StyledTop>
        <StyledLogo src={dao?.daoMetadata?.avatar} />

        <StyledTitleLoader
          isLoading={isLoading}
          component={
            <Typography variant="h2" className="title">
              {dao?.daoMetadata?.name}
            </Typography>
          }
        />

        <StyledJoin disabled={isLoading}>Join</StyledJoin>
      </StyledTop>
      <Navigation />
      <StyledSocials
        github={dao?.daoMetadata?.github}
        twitter={dao?.daoMetadata?.twitter}
        website={dao?.daoMetadata?.website}
      />
    </StyledContainer>
  );
}

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
  const { isDaoOwner, isProposalOnwer, isLoading } = useIsOwner(daoAddress);

  const isOwner = isDaoOwner || isProposalOnwer;

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
    navigate: (daoId: string) => appNavigation.daoPage.root(daoId),
    path: routes.space,
  },

  {
    title: "About",
    navigate: (daoId: string) => appNavigation.daoPage.about(daoId),
    path: routes.spaceAbout,
  },
  {
    title: "New proposal",
    navigate: (daoId: string) => appNavigation.daoPage.create(daoId),
    path: routes.createProposal,
    onlyOwner: true,
  },
];

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

const StyledJoin = styled(Button)({
  minWidth: 120,
});

const StyledContainer = styled(SideMenu)({
  padding: 0,
  maxWidth: 300,
});

const StyledLogo = styled(Img)({
  width: 90,
  height: 90,
  borderRadius: "50%",
});
