import App from "App";
import { Layout } from "Layout";
import { ProposalPage, SpacesPage, SpacePage } from "pages";
import { createBrowserRouter, useNavigate } from "react-router-dom";

export const routes = {
  spaces: "/",
  space: "/:spaceId",
  proposal: "/:spaceId/proposal/:proposalId",
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: routes.spaces,
        element: <SpacesPage />,
        
      },
      {
        path: routes.space,
        element: <SpacePage />,
      },
      {
        path: routes.proposal,
        element: <ProposalPage />,
      },
    ],
  },
]);

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateToSpace = (spaceId: string) => {
    navigate(routes.space.replace(":spaceId", spaceId));
  };

  const navigateToProposal = (spaceId: string, proposalId: string) => {
    navigate(
      routes.proposal
        .replace(":spaceId", spaceId)
        .replace(":proposalId", proposalId)
    );
  };

  const navigateHome = () => {
    navigate(routes.spaces);
  }

  return { navigateToSpace, navigateToProposal, navigateHome };
};
