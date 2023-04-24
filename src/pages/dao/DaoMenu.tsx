import { styled, Typography } from "@mui/material";
import { Img, SideMenu, AddressDisplay, OverflowText } from "components";
import { routes } from "consts";
import { useCurrentRoute, useDaoAddress, useIsOwner } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { Link as RouterLink } from "react-router-dom";
import { appNavigation } from "router";
import { StyledFlexColumn, StyledSkeletonLoader } from "styles";
import Socials from "./Socials";

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
        <StyledLogo src={dao?.daoMetadata?.avatar} />

        <StyledFlexColumn>
          <StyledOverflowText
            limit={20}
            className="title"
            value={dao?.daoMetadata?.name}
          />
          <AddressDisplay address={dao?.daoAddress} />
        </StyledFlexColumn>
      </StyledTop>
      <Navigation />
      <StyledSocials
        github={dao?.daoMetadata?.github}
        telegram={dao?.daoMetadata?.telegram}
        website={dao?.daoMetadata?.website}
      />
    </StyledContainer>
  );
}

const StyledOverflowText = styled(OverflowText)({
  color:'black',
  fontWeight: 700,
  fontSize: 20
});

const StyledTop = styled(StyledFlexColumn)({
  padding: 20,
  paddingBottom: 0,
  gap: 25,
});

const StyledLoader = styled(StyledTop)({
  paddingBottom: 20,
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

const StyledNavigationLink = styled(RouterLink)<{ selected: boolean }>(
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

const StyledContainer = styled(SideMenu)({
  padding: 0,
  maxWidth: 280,
});

const StyledLogo = styled(Img)({
  width: 70,
  height: 70,
  borderRadius: "50%",
});
