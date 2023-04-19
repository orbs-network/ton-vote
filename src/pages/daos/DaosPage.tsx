import { Box, styled } from "@mui/material";
import {  Page } from "components";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { DaosList } from "./DaosList";
 function DaosPage() {
  return (
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <StyledContainer>
        <DaosList />
      </StyledContainer>
    </QueryParamProvider>
  );
}

export default DaosPage;


const StyledContainer = styled(Page)({});
