import _ from "lodash";

export const routes = {
  spaces: "/",
  createSpace: "/setup",
  proposal: "/:daoId/proposal/:proposalId",
  editProposal: "/:daoId/proposal/:proposalId/edit",
  spaceAbout: "/:daoId/about",
  spaceSettings: "/:daoId/settings",
  createProposal: "/:daoId/create",
  airdrop: "/airdrop",
  space: "/:daoId",
};

export const flatRoutes = _.map(routes, (value) => {
  return { path: value };
});


export const TOOLBAR_WIDTH = 60;
export const ZERO_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

export const TELETGRAM_URL = "https://t.me/TONVoteSupportGroup";
export const WHITEPAPER_URL = 'https://www.orbs.com/white-papers/ton-vote/'
export const ABOUT_URL = "https://www.orbs.com/Orbs-Introduces-TON-vote/";
export const ABOUT_CHARS_LIMIT = 2350;
export const TITLE_LIMIT =   180;


export const corsProxyURL = "https://cors-anywhere.herokuapp.com";

export const MOBILE_WIDTH = 768;




export const ONE_WALLET_ONE_VOTE_URL =
  "https://github.com/orbs-network/ton-vote/blob/main/README.md#supported-strategies";