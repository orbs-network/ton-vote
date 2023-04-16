import { Box, Fade, styled } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
import { StyledFlexRow } from "styles";
import { DaoMenu } from "./DaoMenu";

function SpaceMenuLayout() {
  return (
    <Fade in={true}>
      <StyledContainer>
        <DaoMenu />
        <StyledOutlet>
          <Outlet />
        </StyledOutlet>
      </StyledContainer>
    </Fade>
  );
}

export { SpaceMenuLayout };

const StyledContainer = styled(StyledFlexRow)({
    alignItems:'flex-start',
    gap: 30
})

const StyledOutlet = styled(Box)({
  flex: 1,
});
