import { styled, Typography } from "@mui/material";
import { Container, Page } from "components";
import { routes } from "consts";
import { useState } from "react";
import { StyledFlexRow } from "styles";
import { SideMenu } from "./SideMenu";
import GettingStarted from "./steps/GettingStarted";
import { useCreateSpaceStore } from "./store";


const steps = [<GettingStarted />]

function CreateSpace() {
    const {step} = useCreateSpaceStore();
  
  return (
    <Page back={routes.spaces}>
      <StyledContainer>
        <SideMenu />
        <StyledStep title="Create a space">{steps[step]}</StyledStep>
      </StyledContainer>
    </Page>
  );
}

export default CreateSpace;

const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
});

const StyledStep = styled(Container)({
  flex: 1,
});
