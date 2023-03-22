import { styled, Typography } from "@mui/material";
import { Container, Page } from "components";
import { routes } from "consts";
import { StyledFlexRow } from "styles";
import Main from "./Main";
import Preview from "./Preview";


export function CreateDao() {
  
  return (
    <Page back={routes.spaces}>
      <StyledContainer>
        <Preview />
       <Main />
      </StyledContainer>
    </Page>
  );
}


const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
});

const StyledStep = styled(Container)({
  flex: 1,
});
