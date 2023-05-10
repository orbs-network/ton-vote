import { Box, Fade, styled } from "@mui/material";
import { Page } from "components";
import { MOBILE_WIDTH } from "consts";
import React from "react";
import { Outlet } from "react-router-dom";
import { StyledFlexRow } from "styles";
import { DaoMenu } from "./dao-menu/DaoMenu";

export function SpaceMenuLayout() {
  return (
    <Page hideBack={true}>
      <Fade in={true}>
        <StyledContainer>
          <DaoMenu />
          <StyledOutlet>
            <Outlet />
          </StyledOutlet>
        </StyledContainer>
      </Fade>
    </Page>
  );
}


const StyledContainer = styled(StyledFlexRow)({
  alignItems: "flex-start",
  gap: 20,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    flexDirection: "column",
  },
});

const StyledOutlet = styled(Box)({
  flex: 1,
});
