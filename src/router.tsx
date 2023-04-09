import { routes } from "consts";
import Layout from "Layout";
import _ from "lodash";
import {
  ProposalPage,
  DaoPage,
  About as DaoAbout,
  DaoProposals,
  CreateProposal,
  DaosPage,
  CreateDao
} from "pages";
import { SpaceMenuLayout } from "pages/dao/SpaceMenuLayout";
import { createBrowserRouter, useNavigate } from "react-router-dom";

export const appNavigation = {
  spaces: routes.spaces,
  daoPage: {
    root: (daoId: string) => routes.space.replace(":daoId", daoId),
    about: (daoId: string) => `${routes.spaceAbout.replace(":daoId", daoId)}`,
    create: (daoId: string) => routes.createProposal.replace(":daoId", daoId),
  },
  proposalPage: {
    root: (daoId: string, proposalId: string) =>
      routes.proposal
        .replace(":daoId", daoId)
        .replace(":proposalId", proposalId),
  },
};

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    daoPage: {
      root: (daoId: string) => navigate(appNavigation.daoPage.root(daoId)),
      createProposal: (daoId: string) =>
        navigate(appNavigation.daoPage.create(daoId)),
      about: (daoId: string) =>
        navigate(appNavigation.daoPage.about(daoId)),
    },
    proposalPage: {
      root: (daoId: string, proposalId: string) =>
        navigate(appNavigation.proposalPage.root(daoId, proposalId)),
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
            path: routes.createProposal,
            element: <CreateProposal />,
          },
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
