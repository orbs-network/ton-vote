
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

import { createBrowserRouter, useNavigate } from "react-router-dom";
import { StyledFlexColumn } from "styles";


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



