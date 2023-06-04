import Layout from "layout/Layout";
import _ from "lodash";
import { routes } from "consts";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { useDevFeatures } from "hooks";
import { BadRoute, CreateDao, CreateProposal, Dao, DaoAbout, DaoSettings, DaosPage, EditProposal, Proposal, ProposalDisplay, ProposalsList } from "pages";

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
              element: <CreateDao />,
            },

            {
              path: routes.space,
              element: <Dao />,
              children: [
                {
                  path: routes.createProposal,
                  element: <CreateProposal />
                },
                {
                  index: true,
                 element: <ProposalsList />
                },
                {
                  path: routes.spaceSettings,
                  element: <DaoSettings />
                },
                {
                  path: routes.spaceAbout,
                  element: <DaoAbout />
                },
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
                  element: <EditProposal />
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
