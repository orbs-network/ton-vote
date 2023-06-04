import {
  DaosPage,
  CreateDaoPage,
  Dao,
  DaoLayout,
  ProposalsList,
  DaoPageAbout,
  ProposalPage,
  CreateProposal,
  BadRoute,
  DaoSettings,
} from "pages";
import Layout from "layout/Layout";

import _ from "lodash";

import { routes } from "consts";

import { createBrowserRouter } from "react-router-dom";
  
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
        element: <CreateDaoPage />,
      },

      {
        path: routes.space,
        element: <Dao />,
        children: [
          {
            path: routes.createProposal,
            element: <CreateProposal />,
          },
          {
            path: routes.space,
            element: <DaoLayout />,
            children: [
              {
                index: true,
                element: <ProposalsList />,
              },
              {
                path: routes.spaceSettings,
                element: <DaoSettings />,
              },
              {
                path: routes.spaceAbout,
                element: <DaoPageAbout />,
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
