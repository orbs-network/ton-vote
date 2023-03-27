import { styled } from "@mui/material";
import { Page } from "components";
import { routes } from "consts";
import { StyledFlexRow } from "styles";
import { SideMenu } from "./SideMenu";
import { Steps } from "./steps/Steps";

export function CreateDao() {
  return (
    <Page back={routes.spaces}>
      <StyledContainer>
        <SideMenu />
        <Steps />
      </StyledContainer>
    </Page>
  );
}

const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
  width: "100%",
});
