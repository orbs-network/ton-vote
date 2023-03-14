import { Box, styled } from "@mui/material";
import { Container, Page } from "components";
import { SpacesList } from "./SpacesList";

function SpacesPage() {
  return (
    <StyledContainer>
      <SpacesList />
    </StyledContainer>
  );
}

export { SpacesPage };

const StyledContainer = styled(Page)({});
