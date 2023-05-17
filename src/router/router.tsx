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
import { styled, Typography } from "@mui/material";
import Layout from "layout/Layout";
import { Button, Container } from "components";

import _ from "lodash";

import { routes } from "consts";

import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { IS_DEV } from "config";

export const router = createBrowserRouter([
  {
    path: '/', 
    element: <Layout />,
    children: [
      {
        path: routes.spaces,
        element: <DaosPage />,
      },
      {
        path: routes.createSpace,
        element: IS_DEV ? <CreateDaoPage /> : <Navigate to={"/"} />,
      },

      {
        path: routes.space,
        element: <DaoPage />,
        children: [
          {
            path: routes.createProposal,
            element: IS_DEV ? <CreateProposal /> : <Navigate to={"/"} />,
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
