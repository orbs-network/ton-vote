import { Box, styled } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
import { StyledFlexRow } from "styles";
import { SideMenu } from "./SideMenu";

function SpaceMenuLayout() {
  return (
    <StyledContainer>
      <SideMenu />
      <StyledOutlet>
        <Outlet />
      </StyledOutlet>
    </StyledContainer>
  );
}

export { SpaceMenuLayout };

const StyledContainer = styled(StyledFlexRow)({
    alignItems:'flex-start'
})

const StyledOutlet = styled(Box)({
  flex: 1,
});
