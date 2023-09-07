import Layout from "layout/Layout";
import _ from "lodash";
import { routes } from "consts";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import { useDevFeatures } from "hooks/hooks";
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

export const useRouter = () => {
  const devFeatures = useDevFeatures();

  return useMemo(
    () =>
      createBrowserRouter([
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
              path: "airdrop",
              element: (
                <Suspense fallback={<DaosPageFallback />}>
                  <Airdrop />
                </Suspense>
              ),
            },
            {
              path: routes.createSpace,
              errorElement: <Navigate to={routes.spaces} />,
              element: (
                <Suspense fallback={<PageFallback />}>
                  <CreateDao />
                </Suspense>
              ),
            },

            {
              path: routes.space,
              errorElement: <Navigate to={routes.spaces} />,
              element: (
                <Suspense fallback={<DaoPageFallback />}>
                  <Dao />
                </Suspense>
              ),
              children: [
                {
                  path: routes.createProposal,
                  errorElement: <Navigate to={routes.spaces} />,
                  element: (
                    <Suspense fallback={<PageFallback />}>
                      <CreateProposal />
                    </Suspense>
                  ),
                },
                {
                  index: true,
                  errorElement: <Navigate to={routes.spaces} />,
                  element: (
                    <Suspense fallback={<PageFallback />}>
                      <ProposalsList />
                    </Suspense>
                  ),
                },
                {
                  path: routes.spaceSettings,
                  errorElement: <Navigate to={routes.spaces} />,
                  element: devFeatures ? (
                    <Suspense fallback={<PageFallback />}>
                      <DaoSettings />
                    </Suspense>
                  ) : (
                    <Navigate to={routes.space} />
                  ),
                },
                {
                  path: routes.spaceAbout,
                  errorElement: <Navigate to={routes.spaces} />,
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
              errorElement: <Navigate to={routes.spaces} />,
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
                  element: devFeatures ? (
                    <Suspense fallback={<PageFallback />}>
                      <EditProposal />
                    </Suspense>
                  ) : (
                    <Navigate to={routes.spaces} />
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
      ]),
    [devFeatures]
  );
};
