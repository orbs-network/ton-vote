import Layout from "layout/Layout";
import _ from "lodash";
import { routes } from "consts";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { useDevFeatures } from "hooks";
import { BadRoute } from "pages";


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
              async lazy() {
                let page = await import("../pages/daos/DaosPage");
                return { Component: page.default };
              },
            },
            {
              path: routes.createSpace,
              async lazy() {
                let page = await import("../pages/create-dao/CreateDao");
                return {
                  Component: devFeatures ? page.default : ForbiddenRoute,
                };
              },
            },

            {
              path: routes.space,
              async lazy() {
                let page = await import("../pages/dao/Dao");
                return { Component: page.default };
              },

              children: [
                {
                  path: routes.createProposal,
                  async lazy() {
                    let page = await import(
                      "../pages/dao/CreateProposal/CreateProposal"
                    );
                    return {
                      Component: devFeatures ? page.default : ForbiddenRoute,
                    };
                  },
                },
                {
                  index: true,
                  async lazy() {
                    let page = await import(
                      "../pages/dao/ProposalsList/ProposalsList"
                    );
                    return { Component: page.default };
                  },
                },
                {
                  path: routes.spaceSettings,
                  async lazy() {
                    let page = await import(
                      "../pages/dao/DaoSettings/DaoSettings"
                    );
                    return { Component: page.default };
                  },
                },
                {
                  path: routes.spaceAbout,
                  async lazy() {
                    let page = await import("../pages/dao/DaoAbout");
                    return { Component: page.default };
                  },
                },
              ],
            },
            {
              path: routes.proposal,
              async lazy() {
                let page = await import("../pages/proposal/Proposal");
                return { Component: page.default };
              },
            },
          ],
          errorElement: <BadRoute />,
        },
      ]),
    [devFeatures]
  );
};



const ForbiddenRoute = () => {
  return <Navigate to={routes.spaces} />;
}