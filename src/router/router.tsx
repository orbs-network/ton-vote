import {
  DaosPage,
  CreateDaoPage,
  DaoPage,
  SpaceMenuLayout,
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

import { createBrowserRouter, Navigate } from "react-router-dom";
import { IS_DEV, IS_BETA } from "config";


const showBetaRoute = IS_BETA || IS_DEV;

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
        element: showBetaRoute ? <CreateDaoPage /> : <Navigate to={"/"} />,
      },

      {
        path: routes.space,
        element: <DaoPage />,
        children: [
          {
            path: routes.createProposal,
            element: showBetaRoute ? <CreateProposal /> : <Navigate to={"/"} />,
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
