import { styled, Typography } from "@mui/material";
import Layout from "layout/Layout";
import { Button, Container } from "components";

import _ from "lodash";

import { routes } from "consts";

import { createBrowserRouter, useNavigate } from "react-router-dom";
import { StyledFlexColumn } from "styles";
import { DaosPage, CreateDaoPage, DaoPage, CreateProposal, SpaceMenuLayout, ProposalsList, DaoPageAbout, ProposalPage } from "pages";

export const appNavigation = {
  spaces: routes.spaces,
  daoPage: {
    root: (daoId: string) => routes.space.replace(":daoId", daoId),
    about: (daoId: string) => `${routes.spaceAbout.replace(":daoId", daoId)}`,
    create: (daoId: string) => routes.createProposal.replace(":daoId", daoId),
  },
  proposalPage: {
    root: (daoId: string, proposalId: string) =>
      routes.proposal
        .replace(":daoId", daoId)
        .replace(":proposalId", proposalId),
  },
};

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    daoPage: {
      root: (daoId: string) => navigate(appNavigation.daoPage.root(daoId)),
      createProposal: (daoId: string) =>
        navigate(appNavigation.daoPage.create(daoId)),
      about: (daoId: string) =>
        navigate(appNavigation.daoPage.about(daoId)),
    },
    proposalPage: {
      root: (daoId: string, proposalId: string) =>
        navigate(appNavigation.proposalPage.root(daoId, proposalId)),
    },
    daosPage: {
      root: () => navigate(routes.spaces),
    },
    createSpace: {
      root: () => navigate(routes.createSpace),
    },
  };
};

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


 function BadRoute() {
   const navigate = useAppNavigation();
   return (
     <Layout>
       <StyledContainer>
         <StyledFlexColumn gap={20}>
           <Typography className="title">Page doesn't exist</Typography>
           <Button onClick={() => navigate.daosPage.root()}>
             <Typography>Go Home</Typography>
           </Button>
         </StyledFlexColumn>
       </StyledContainer>
     </Layout>
   );
 }


 const StyledContainer = styled(Container)({
   width: "100%",
   maxWidth: 500,
   ".title": {
     fontSize: 20,
     fontWeight: 600,
   },
   button: {
     width: "70%",
   },
 });