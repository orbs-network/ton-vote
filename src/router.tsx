import { routes } from "consts";
import Layout from "layout/Layout";
import _ from "lodash";

import BadRoute from "pages/BadRoute";
import CreateDao from "pages/create-dao/CreateDao";
import About from "pages/dao/About";
import CreateProposal from "pages/dao/CreateProposal/CreateProposal";
import DaoPage from "pages/dao/DaoPage";
import ProposalsList from "pages/dao/ProposalsList/ProposalsList";
import SpaceMenuLayout from "pages/dao/SpaceMenuLayout";
import DaosPage from "pages/daos/DaosPage";
import ProposalPage from "pages/proposal/ProposalPage";
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
                element: <ProposalsList />,
              },
              {
                path: routes.spaceAbout,
                element: <About />,
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
    errorElement: <BadRoute />,
  },
]);
