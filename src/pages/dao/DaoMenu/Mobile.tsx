import { styled, Typography } from "@mui/material";
import { Button, Container, Menu } from "components";
import React, { useMemo } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineExternalLink, HiOutlineDotsHorizontal } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Webapp } from "WebApp";
import { Address, DNS, Logo, Title } from "./Components";
import { useNavigationLinks, useSocials } from "./hooks";

export const MobileMenu = () => {
  return (
    <StyledMobileMenu>
      <StyledFlexRow gap={15} alignItems="flex-start">
        <Logo />
        <StyledFlexColumn gap={5} alignItems="flex-start" style={{ flex: 1 }}>
          <Title />
          <StyledFlexColumn gap={4} alignItems="flex-start">
            <DNS />
            <Address />
          </StyledFlexColumn>
        </StyledFlexColumn>
      </StyledFlexRow>
      <MobileNavigation />
    </StyledMobileMenu>
  );
};
const StyledMobileMenu = styled(Container)({
  position: "relative",
  width: "100%",
  padding: "15px 40px 15px 15px",
  ".overflow-with-tooltip": {
    width: "100%",
  },
});

const MobileNavigation = () => {
  const navigations = useNavigationLinks();  
  const navigate = useNavigate();
  const links = useSocials();

  const listItems = useMemo(() => {
    const appLinks = navigations!
      .filter((navigation) => !navigation.hide)
      .map((navigation) => {
        return (
          <StyledMobileMenuItem
            selected={navigation.selected ? 1 : 0}
            onClick={() => navigate(navigation.path)}
            key={navigation.title}
          >
            <Typography>{navigation.title}</Typography>
            {navigation.selected && (
              <BsCheck2 style={{ width: 20, height: 20 }} />
            )}
          </StyledMobileMenuItem>
        );
      });

    const outerLinks = links.map((link) => {
      return (
        <StyledMobileMenuItem
          key={link?.title}
          onClick={() => window.open(link?.value, "_blank")}
        >
          <Typography>{link?.title}</Typography>
          <HiOutlineExternalLink style={{ width: 18, height: 18 }} />
        </StyledMobileMenuItem>
      );
    });

    return [appLinks, outerLinks];
  }, [navigations, links]);

  return <StyledMenu Button={MenuButton} listItems={listItems} />;
};

const MenuButton = ({ onClick }: { onClick: (e: any) => void }) => {

  return (
    <StyledMenuButton
      onClick={(e) => {
        onClick(e);
        Webapp.hapticFeedback();
      }}
    >
      <HiOutlineDotsHorizontal />
    </StyledMenuButton>
  );
};

const StyledMenu = styled(Menu)({
  ".MuiPaper-root": {
    minWidth: 200,
    padding: "0px",
  },
  li: {
    height: 40,
  },
});

const StyledMenuButton = styled(Button)({
  position: "absolute",
  right: 5,
  top: 8,
  height: 'auto',
  width: 'auto',
  padding: 6,
  svg: {
    width: 16,
    height: 16,
  },
});

export const StyledMobileMenuItem = styled(StyledFlexRow)<{
  selected?: number;
}>(({ theme, selected }) => {
  const color =
    theme.palette.mode === "light" ? "rgba(51, 172, 238, 0.07)" : "";
  return {
    height: "100%",
    justifyContent: "space-between",
    padding: "0px 15px",
    background: selected ? color : "none",
    svg: {
      color: theme.palette.primary.main,
    },
    p: {
      fontSize: 15,
    },
  };
});
