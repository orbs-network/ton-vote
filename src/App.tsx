import { Box } from "@mui/material";
import {
  useConnectionEvenSubscription,
  useEmbededWallet,
  useGetClients,
  useRestoreConnection,
} from "connection";
import { RouterProvider } from "react-router-dom";
import { router } from "router";
import ScrollTop from "components/ScrollTop";
import { EndpointPopup } from "components";
import { useEffect } from "react";
import { useAppPersistedStore } from "store";

export const useGetClientsOnLoad = () => {
  const store = useAppPersistedStore();
  const { mutate: getClients } = useGetClients();

  useEffect(() => {
    getClients({
      clientV2Endpoint: store.clientV2Endpoint,
      clientV4Endpoint: store.clientV4Endpoint,
      apiKey: store.apiKey,
    });
  }, []);
};

function App() {
  useGetClientsOnLoad();
  useRestoreConnection();
  useEmbededWallet();
  useConnectionEvenSubscription();

  return (
    <Box>
      <RouterProvider router={router} />
      <ScrollTop />
      <EndpointPopup />
    </Box>
  );
}

export default App;
