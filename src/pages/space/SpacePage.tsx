import { Fade, styled } from "@mui/material";
import { Page } from "components";
import { SideMenu } from "./SideMenu";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/system";
import { StyledFlexRow } from "styles";
import { routes } from "consts";

function SpacePage() {
  return (
    <Page back={routes.spaces}>
      <StyledFlexRow alignItems='flex-start'>
        <SideMenu />
        <StyledOutlet>
          <Outlet />
        </StyledOutlet>
      </StyledFlexRow>
    </Page>
  );
}

const StyledOutlet = styled(Box)({
  flex: 1,
});


export { SpacePage };
