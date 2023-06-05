import Layout from "layout/Layout";
import _ from "lodash";
import { routes } from "consts";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { useDevFeatures } from "hooks";
import {
  BadRoute,
  CreateDao,
  CreateProposal,
  Dao,
  DaoAbout,
  DaoSettings,
  DaosPage,
  EditProposal,
  Proposal,
  ProposalDisplay,
  ProposalsList,
} from "pages";
import { ProjectWebsite } from "pages/dao/LinkPage";

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
              element: <DaosPage />,
            },
            {
              path: routes.createSpace,
              element: devFeatures ? (
                <CreateDao />
              ) : (
                <Navigate to={routes.spaces} />
              ),
            },

            {
              path: routes.space,
              element: <Dao />,
              children: [
                {
                  path: routes.createProposal,
                  element: devFeatures ? (
                    <CreateProposal />
                  ) : (
                    <Navigate to={routes.space} />
                  ),
                },
                {
                  index: true,
                  element: <ProposalsList />,
                },
                {
                  path: routes.spaceSettings,
                  element: devFeatures ? (
                    <DaoSettings />
                  ) : (
                    <Navigate to={routes.space} />
                  ),
                },
                {
                  path: routes.spaceAbout,
                  element: <DaoAbout />,
                },
                {
                  path: routes.website,
                  element: <ProjectWebsite />
                }
              ],
            },
            {
              path: routes.proposal,
              element: <Proposal />,
              children: [
                {
                  path: routes.proposal,
                  element: <ProposalDisplay />,
                },
                {
                  path: routes.editProposal,
                  element: devFeatures ? (
                    <EditProposal />
                  ) : (
                    <Navigate to={routes.proposal} />
                  ),
                },
              ],
            },
          ],
          errorElement: <BadRoute />,
        },
      ]),
    [devFeatures]
  );
};

// const Dao = lazy(() => import("pages/dao/Dao"));
// const Proposal = lazy(() => import("pages/proposal/Proposal"));
// const EditProposal = lazy(() => import("pages/proposal/EditProposal"));
// const DaosPage = lazy(() => import("pages/daos/DaosPage"));
// const DaoAbout = lazy(() => import("pages/dao/DaoAbout"));

// const CreateProposal = lazy(
//   () => import("pages/dao/CreateProposal/CreateProposal")
// );

// const DaoSettings = lazy(() => import("pages/dao/DaoSettings/DaoSettings"));

// const CreateDao = lazy(() => import("pages/create-dao/CreateDao"));

// const ProposalsList = lazy(
//   () => import("pages/dao/ProposalsList/ProposalsList")
// );

// const ProposalDisplay = lazy(
//   () => import("pages/proposal/ProposalDisplay/ProposalDisplay")
// );

// export const useRouter = () => {
//   const devFeatures = useDevFeatures();

//   return useMemo(
//     () =>
//       createBrowserRouter([
//         {
//           path: "/",
//           element: <Layout />,
//           children: [
//             {
//               path: routes.spaces,
//               element: (
//                 <Suspense fallback={<DaosPageFallback />}>
//                   <DaosPage />
//                 </Suspense>
//               ),
//             },
//             {
//               path: routes.createSpace,
//               element: devFeatures ? (
//                 <Suspense fallback={<PageFallback />}>
//                   <CreateDao />
//                 </Suspense>
//               ) : (
//                 <Navigate to={routes.spaces} />
//               ),
//             },

//             {
//               path: routes.space,
//               element: (
//                 <Suspense fallback={<DaoPageFallback />}>
//                   <Dao />
//                 </Suspense>
//               ),
//               children: [
//                 {
//                   path: routes.createProposal,
//                   element: devFeatures ? (
//                     <Suspense fallback={<PageFallback />}>
//                       <CreateProposal />
//                     </Suspense>
//                   ) : (
//                     <Navigate to={routes.space} />
//                   ),
//                 },
//                 {
//                   index: true,
//                   element: (
//                     <Suspense fallback={<PageFallback />}>
//                       <ProposalsList />
//                     </Suspense>
//                   ),
//                 },
//                 {
//                   path: routes.spaceSettings,
//                   element: devFeatures ? (
//                     <Suspense fallback={<PageFallback />}>
//                       <DaoSettings />
//                     </Suspense>
//                   ) : (
//                     <Navigate to={routes.space} />
//                   ),
//                 },
//                 {
//                   path: routes.spaceAbout,
//                   element: (
//                     <Suspense fallback={<PageFallback />}>
//                       <DaoAbout />
//                     </Suspense>
//                   ),
//                 },
//               ],
//             },
//             {
//               path: routes.proposal,
//               element: (
//                 <Suspense fallback={<PageFallback />}>
//                   <Proposal />
//                 </Suspense>
//               ),
//               children: [
//                 {
//                   path: routes.proposal,
//                   element: (
//                     <Suspense fallback={<PageFallback />}>
//                       <ProposalDisplay />
//                     </Suspense>
//                   ),
//                 },
//                 {
//                   path: routes.editProposal,
//                   element: devFeatures ? (
//                     <Suspense fallback={<PageFallback />}>
//                       <EditProposal />
//                     </Suspense>
//                   ) : (
//                     <Navigate to={routes.proposal} />
//                   ),
//                 },
//               ],
//             },
//           ],
//           errorElement: <BadRoute />,
//         },
//       ]),
//     [devFeatures]
//   );
// };
