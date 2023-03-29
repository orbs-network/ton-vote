import { styled } from "@mui/material";
import { Box } from "@mui/system";
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
import { useClientStore, useGetClientsOnLoad } from "store";

export const router = createBrowserRouter(
  [
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
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);
function App() {
  const restoreConnection = useRestoreConnection();
  const getClients = useGetClientsOnLoad();
  useConnectionEvenSubscription();
  const handleEmbededWallet = useEmbededWallet();
  const { clientV2, clientV4 } = useClientStore();

  useEffect(() => {
    restoreConnection();
    getClients();
    handleEmbededWallet();
  }, []);

  if (!clientV2 || !clientV4) return null;

  return (
    <StyledApp>
      <RouterProvider router={router} />
    </StyledApp>
  );
}

export default App;

const StyledApp = styled(Box)({
  paddingBottom: 0,
});
