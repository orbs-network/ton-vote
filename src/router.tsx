import { routes } from "consts";
import { Layout } from "Layout";
import _ from "lodash";
import {
  ProposalPage,
  SpacesPage,
  SpacePage,
  SpaceAbout,
  SpaceProposals,
  CreateProposal,
} from "pages";
import CreateSpace from "pages/create-space/CreateSpace";
import { SpaceMenuLayout } from "pages/space/SpaceMenuLayout";
import { createBrowserRouter, useNavigate } from "react-router-dom";

export const appNavigation = {
  spacePage: {
    root: (spaceId: string) => routes.space.replace(":spaceId", spaceId),
    about: (spaceId: string) =>
      `${routes.spaceAbout.replace(":spaceId", spaceId)}`,
    create: (spaceId: string) =>
      routes.createProposal.replace(":spaceId", spaceId),
  },
  proposalPage: {
    root: (spaceId: string, proposalId: string) =>
      routes.proposal
        .replace(":spaceId", spaceId)
        .replace(":proposalId", proposalId),
  },
};

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    spacePage: {
      root: (spaceId: string) =>
        navigate(appNavigation.spacePage.root(spaceId)),
      createProposal: (spaceId: string) =>
        navigate(appNavigation.spacePage.create(spaceId)),
      about: (spaceId: string) =>
        navigate(appNavigation.spacePage.about(spaceId)),
    },
    proposalPage: {
      root: (spaceId: string, proposalId: string) =>
        navigate(appNavigation.proposalPage.root(spaceId, proposalId)),
    },
    spacesPage: {
      root: () => navigate(routes.spaces),
    },
    createSpace: {
      root: () => navigate(routes.createSpace),
    },
  };
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
        path: routes.createSpace,
        element: <CreateSpace />,
      },

      {
        path: routes.space,
        element: <SpacePage />,
        children: [
          {
            path: routes.space,
            element: <SpaceMenuLayout />,
            children: [
              {
                index: true,
                element: <SpaceProposals />,
              },
              {
                path: routes.spaceAbout,
                element: <SpaceAbout />,
              },
              {
                path: routes.createProposal,
                element: <CreateProposal />,
              },
            ],
          },
        ],
      },
      {
        path: routes.proposal,
        element: <ProposalPage />,
      },
    ],
  },
]);
