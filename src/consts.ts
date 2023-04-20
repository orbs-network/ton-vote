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

export const TELETGRAM_URL = "https://t.me/TONVoteSupportGroup";
export const WHITEPAPER_URL = 'https://www.orbs.com/white-papers/ton-vote/'
export const ABOUT_URL = "https://www.orbs.com/Orbs-Introduces-TON-vote/";