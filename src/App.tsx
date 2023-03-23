import { Box } from "@mui/material";
import {
  useConnectionEvenSubscription,
  useEmbededWallet,
  useRestoreConnection,
} from "connection";
import { RouterProvider } from "react-router-dom";
import { router } from "router";
import ScrollTop from "components/ScrollTop";
import { EndpointPopup } from "components";
import { Helmet } from "react-helmet";
import { APP_TITLE } from "config";


function App() {
  useRestoreConnection();
  useEmbededWallet();
  useConnectionEvenSubscription();

  return (
    <Box>
    
      <Helmet>
        <title>{APP_TITLE}</title>
      </Helmet>
      <RouterProvider router={router} />
      <ScrollTop />
      <EndpointPopup />
    </Box>
  );
}

export default App;
