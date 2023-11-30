import Layout from "layout/Layout";
import _ from "lodash";
import { routes } from "consts";
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DaoPageFallback, DaosPageFallback, PageFallback } from "./fallbacks";

const CreateDao = lazy(() => import("pages/create-dao/CreateDao"));
const DaoSettings = lazy(() => import("pages/dao/DaoSettings/DaoSettings"));
const DaoAbout = lazy(() => import("pages/dao/DaoAbout"));
const Airdrop = lazy(() => import("pages/airdrop/Airdrop"));
const DaosPage = lazy(() => import("pages/daos/DaosPage"));
const Dao = lazy(() => import("pages/dao/Dao"));
const ProposalsList = lazy(
  () => import("pages/dao/ProposalsList/ProposalsList")
);
const ProposalDisplay = lazy(
  () => import("pages/proposal/ProposalDisplay/ProposalDisplay")
);
const CreateProposal = lazy(
  () => import("pages/dao/CreateProposal/CreateProposal")
);

const EditProposal = lazy(() => import("pages/proposal/EditProposal"));

const Proposal = lazy(() => import("pages/proposal/Proposal"));
const BadRoute = lazy(() => import("pages/BadRoute"));

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
            element: (
              <Suspense fallback={<PageFallback />}>
                <ProposalDisplay />
              </Suspense>
            ),
          },
          {
            path: routes.editProposal,
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
