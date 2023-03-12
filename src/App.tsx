import { Box, styled } from "@mui/material";
import {
  useConnectionEvenSubscription,
  useEmbededWallet,
  useRestoreConnection,
} from "connection";
import { useGetClientsOnLoad } from "store";
import { StyledGrid } from "styles";
import { RouterProvider } from "react-router-dom";
import { router } from "router";

function App() {
  useGetClientsOnLoad();
  useRestoreConnection();
  useEmbededWallet();
  useConnectionEvenSubscription();


  return (
    <StyledApp>
      <RouterProvider router={router} />
    </StyledApp>
  );
}

export default App;

const StyledApp = styled(Box)({
  paddingTop: 90,
  minHeight: "100vh",

});
