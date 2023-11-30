import { routes } from "consts";
import { useNavigate } from "react-router-dom";

export const appNavigation = {
  airdrop: routes.airdrop,
  spaces: routes.spaces,
  daoPage: {
    root: (daoId: string) => routes.space.replace(":daoId", daoId),
    about: (daoId: string) => `${routes.spaceAbout.replace(":daoId", daoId)}`,
    create: (daoId: string) => routes.createProposal.replace(":daoId", daoId),
    settings: (daoId: string) => routes.spaceSettings.replace(":daoId", daoId),
  },
  proposalPage: {
    root: (daoId: string, proposalId: string) =>
      routes.proposal
        .replace(":daoId", daoId)
        .replace(":proposalId", proposalId),
    airdrop: (daoId: string, proposalId: string) =>
      routes.airdrop
        .replace(":daoId", daoId)
        .replace(":proposalId", proposalId),
    edit: (daoId: string, proposalId: string) =>
      routes.editProposal
        .replace(":daoId", daoId)
        .replace(":proposalId", proposalId),
  },
};

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    airdrop: () =>  navigate("/airdrop"),
    daoPage: {
      root: (daoId: string) => navigate(appNavigation.daoPage.root(daoId)),
      createProposal: (daoId: string) =>
        navigate(appNavigation.daoPage.create(daoId)),
      about: (daoId: string) => navigate(appNavigation.daoPage.about(daoId)),
    },
    proposalPage: {
      edit: (daoId: string, proposalId: string) =>
        navigate(appNavigation.proposalPage.edit(daoId, proposalId)),
      airdrop: (daoId: string, proposalId: string) =>
        navigate(appNavigation.proposalPage.airdrop(daoId, proposalId)),

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
