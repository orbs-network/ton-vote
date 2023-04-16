import { styled } from "@mui/material";
import LogoImg from "assets/logo.svg";
import { AppTooltip, Container } from "components";
import { routes, TOOLBAR_WIDTH } from "consts";
import { AiOutlinePlus } from "react-icons/ai";
import { Link } from "react-router-dom";
import { appNavigation, useAppNavigation } from "router";
import { StyledFlexColumn, StyledHoverContainer } from "styles";
import { GoSettings } from "react-icons/go";
import { EndpointPopup } from "pages/proposal/EndpointPopup";
import { useState } from "react";
import { useCurrentRoute } from "hooks";

export function Toolbar() {
  const navigation = useAppNavigation();
  const [showCustomEndpoint, setCustomEndpoint] = useState(false);
  const currentRoute = useCurrentRoute();

  return (
    <StyledToolbar>
      <Link to={appNavigation.spaces}>
        <StyledLogo src={LogoImg} />
      </Link>
      <AppTooltip text="Create Dao" placement="right">
        <StyledButton onClick={navigation.createSpace.root}>
          <AiOutlinePlus />
        </StyledButton>
      </AppTooltip>
      {currentRoute === routes.proposal && (
        <>
          <AppTooltip text="Set Custom endpoint" placement="right">
            <StyledButton onClick={() => setCustomEndpoint(true)}>
              <GoSettings />
            </StyledButton>
          </AppTooltip>
          <EndpointPopup
            open={showCustomEndpoint}
            onClose={() => setCustomEndpoint(false)}
          />
        </>
      )}
    </StyledToolbar>
  );
}

const StyledButton = styled(StyledHoverContainer)({
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
    height: 20,
    color: "rgba(114, 138, 150, 0.5)",
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
