import { Box, Fade, styled } from "@mui/material";
import { Page } from "components";
import React from "react";
import { Outlet } from "react-router-dom";
import { StyledFlexRow } from "styles";
import { DaoMenu } from "./DaoMenu";

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
    alignItems:'flex-start',
    gap: 30
})

const StyledOutlet = styled(Box)({
  flex: 1,
});
