import _ from "lodash";

export const routes = {
  spaces: "/",
  createSpace: '/setup',
  proposal: "/:daoId/proposal/:proposalId",
  space: "/:daoId",
  spaceAbout: "/:daoId/about",
  createProposal: "/:daoId/create",
};

export const flatRoutes = _.map(routes, (value) => {
  return { path: value };
});


export const TOOLBAR_WIDTH = 80;
export const ZERO_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";