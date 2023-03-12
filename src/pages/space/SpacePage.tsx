import { styled } from "@mui/material";
import { Page } from "components";
import React from "react";
import { StyledFlexRow } from "styles";
import { Proposals } from "./Proposals";
import { SideMenu } from "./SideMenu";

function SpacePage() {
  return (
    <StyledContainer>
      <SideMenu />
      <Proposals />
    </StyledContainer>
  );
}

const StyledContainer = styled(Page)({
  alignItems: "flex-start",
  gap: 20,
  flexDirection:'row'
});

export { SpacePage };
