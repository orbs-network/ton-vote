import { styled } from "@mui/material";
import { Box } from "@mui/system";
import { EndpointPopup } from "components";
import {
  useConnectionEvenSubscription,
  useEmbededWallet,
  useRestoreConnection,
} from "connection";
import Layout from "Layout";
import { DorahackPage } from "pages/dorahack/Dorahack";
import { FrozenPage } from "pages/frozen/Frozen";
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useGetClientsOnLoad } from "store";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,

    children: [
      {
        path: "/",
        element: <DorahackPage />,
      },
      {
        path: "/frozen",
        element: <FrozenPage />,
      },
      {
        path: "/dorahack",
        element: <DorahackPage />,
      },
    ],
  },
]);

function App() {
  const restoreConnection = useRestoreConnection();
  const getClients = useGetClientsOnLoad();
  useConnectionEvenSubscription();
  const handleEmbededWallet = useEmbededWallet();

  useEffect(() => {
    restoreConnection();
    getClients();
    handleEmbededWallet();
  }, []);

  return (
    <StyledApp>
      <RouterProvider router={router} />
      <EndpointPopup />
    </StyledApp>
  );
}

export default App;

const StyledApp = styled(Box)({

  paddingBottom: 0,
});
