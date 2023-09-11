import Layout from "layout/Layout";
import _ from "lodash";
import { routes } from "consts";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import { DaoPageFallback, DaosPageFallback, PageFallback } from "./fallbacks";
import {
  BadRoute,
  CreateProposal,
  Dao,
  DaoAbout,
  DaosPage,
  EditProposal,
  Proposal,
  ProposalDisplay,
  ProposalsList,
  Airdrop,
} from "pages";

const CreateDao = lazy(() => import("pages/create-dao/CreateDao"));
const DaoSettings = lazy(() => import("pages/dao/DaoSettings/DaoSettings"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: routes.spaces,
        element: (
          <Suspense fallback={<DaosPageFallback />}>
            <DaosPage />
          </Suspense>
        ),
      },
      {
        path: routes.airdrop,
        element: (
          <Suspense fallback={<DaosPageFallback />}>
            <Airdrop />
          </Suspense>
        ),
      },
      {
        path: routes.createSpace,
        element: (
          <Suspense fallback={<PageFallback />}>
            <CreateDao />
          </Suspense>
        ),
      },

      {
        path: routes.space,
        element: (
          <Suspense fallback={<DaoPageFallback />}>
            <Dao />
          </Suspense>
        ),
        children: [
          {
            path: routes.createProposal,
            element: (
              <Suspense fallback={<PageFallback />}>
                <CreateProposal />
              </Suspense>
            ),
          },
          {
            index: true,
            element: (
              <Suspense fallback={<PageFallback />}>
                <ProposalsList />
              </Suspense>
            ),
          },
          {
            path: routes.spaceSettings,
            element: (
              <Suspense fallback={<PageFallback />}>
                <DaoSettings />
              </Suspense>
            ),
          },
          {
            path: routes.spaceAbout,
            element: (
              <Suspense fallback={<PageFallback />}>
                <DaoAbout />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: routes.proposal,
        element: (
          <Suspense fallback={<PageFallback />}>
            <Proposal />
          </Suspense>
        ),
        children: [
          {
            path: routes.proposal,
            errorElement: <Navigate to={routes.spaces} />,
            element: (
              <Suspense fallback={<PageFallback />}>
                <ProposalDisplay />
              </Suspense>
            ),
          },
          {
            path: routes.editProposal,
            errorElement: <Navigate to={routes.spaces} />,
            element: (
              <Suspense fallback={<PageFallback />}>
                <EditProposal />
              </Suspense>
            ),
          },
        ],
      },
    ],
    errorElement: (
      <Suspense fallback={<PageFallback />}>
        <BadRoute />
      </Suspense>
    ),
  },
]);


