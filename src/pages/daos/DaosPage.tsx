import { Box, styled } from "@mui/material";
import {  Page } from "components";
import { DaosList } from "./DaosList";

export function DaosPage() {
  return (
    <StyledContainer>
      <DaosList />
    </StyledContainer>
  );
}


const StyledContainer = styled(Page)({});
