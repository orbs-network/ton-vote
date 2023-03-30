import { routes } from "consts";
import Layout from "Layout";
import _ from "lodash";
import {
  ProposalPage,
  DaoPage,
  DaoAbout,
  DaoProposals,
  CreateProposal,
  DaosPage,
  CreateDao
} from "pages";
import { SpaceMenuLayout } from "pages/dao/SpaceMenuLayout";
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
    daosPage: {
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
        element: <DaosPage />,
      },
      {
        path: routes.createSpace,
        element: <CreateDao />,
      },

      {
        path: routes.space,
        element: <DaoPage />,
        children: [
          {
            path: routes.space,
            element: <SpaceMenuLayout />,
            children: [
              {
                index: true,
                element: <DaoProposals />,
              },
              {
                path: routes.spaceAbout,
                element: <DaoAbout />,
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
