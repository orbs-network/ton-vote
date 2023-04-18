import { styled } from "@mui/material";
import LogoImg from "assets/logo.svg";
import { AppTooltip, Button } from "components";
import { TOOLBAR_WIDTH } from "consts";
import { AiOutlinePlus } from "react-icons/ai";
import { Link } from "react-router-dom";
import { appNavigation, useAppNavigation } from "router";
import { StyledFlexColumn } from "styles";
import { useState } from "react";
import { useCurrentRoute } from "hooks";

export function Toolbar() {
  const navigation = useAppNavigation();


  return (
    <StyledToolbar>
      <Link to={appNavigation.spaces}>
        <StyledLogo src={LogoImg} />
      </Link>
      <AppTooltip text="Create Dao" placement="right">
        <StyledButton
          onClick={navigation.createSpace.root}
          variant="transparent"
        >
          <AiOutlinePlus />
        </StyledButton>
      </AppTooltip>
    </StyledToolbar>
  );
}

const StyledButton = styled(Button)({
  borderRadius: "50%",
  cursor: "pointer",
  padding: 10,
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  svg: {
    width: 20,
    height: 20
  },
});

const StyledLogo = styled("img")({
  width: 40,
  height: 40,
});

const StyledToolbar = styled(StyledFlexColumn)({
  width: TOOLBAR_WIDTH,
  height: "100%",
  background: "white",
  position: "fixed",
  left: 0,
  borderRight: "0.5px solid rgba(114, 138, 150, 0.24)",
  zIndex: 20,
  top: 0,
  justifyContent: "flex-start",
  paddingTop: 20,
});
