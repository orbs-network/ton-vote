import { ReleaseMode } from "ton-vote-contracts-sdk";
export const TONSCAN = "https://tonscan.org";
export const TONSCAN_ADDRESS_URL = `${TONSCAN}/address`;
export const APP_NAME = "TON VOTE";


export const manifestUrl = "https://ton.vote/tonconnect-manifest.json";

export const DEFAULT_CLIENT_V2_ENDPOINT =
  "https://toncenter.com/api/v2/jsonRPC";
export const DEFAULT_CLIENT_V4_ENDPOINT = "https://mainnet-v4.tonhubapi.com";

export const CLIENT_V2_API_KEY =
  "3ebe42d62396ff96725e0de9e71cae2916c1b690d3ffc8a80ecd9af4e8fef6f2";


export const USER_VOTE_LOCAL_STORAGE = "ton_vote_user_vote";

export const PAGE_SIZE = 20;

export const CLIENT_V4_ENDPOINT = "https://mainnet-v4.tonhubapi.com";
export const LAST_FETCH_UPDATE_LIMIT = 90 * 1000;

export const VERIFY_LINK =
  "https://github.com/orbs-network/dao-vote#how-can-you-verify-the-results";

export const GITHUB_URL = "https://github.com/orbs-network/dao-vote";
export const GOOGLE_ANALYTICS_KEY = "G-T4FZCJ26VK";

export enum QueryKeys {
  PROPOSAL_TIMELINE = "PROPOSAL_TIMELINE",
  DAOS = "DAOS",
  PROPOSALS = "PROPOSALS",
  DAO_ROLES = "DAO_ROLES",
  PROPOSAL = "PROPOSAL",
  DAO = "DAO",
  SIGNLE_VOTING_POWER = "SIGNLE_VOTING_POWER",
  CLIENTS = "CLIENTS",
  DAO_FWD_MSG_FEE = "DAO_FWD_MSG_FEE",
  CREATE_DAO_FEE = "CREATE_DAO_FEE",
  REGISTRY_ADMIN = "REGISTRY_ADMIN",
  REGISTRY_ID = "REGISTRY_ID",
  REGISTRY_ADDRESS = "REGISTRY_ADDRESS",
}


export const DAO_REFETCH_INTERVAL = 20_000;
export const DAOS_PAGE_REFETCH_INTERVAL = 20_000;
export const LANGUAGES = { en: "English", ru: "Русский" };

export const VERIFIED_DAOS = [
  "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
];

export const releaseMode = import.meta.env.VITE_STAGING
  ? ReleaseMode.DEVELOPMENT
  : ReleaseMode.PRODUCTION;

export const IS_DEV =
  releaseMode === ReleaseMode.DEVELOPMENT
export  const IS_BETA = import.meta.env.VITE_BETA;
export const TX_FEES = {
  CREATE_DAO: IS_DEV ? 0.085 : 1,
  CREATE_METADATA: IS_DEV ? 0.05 : 1,
  FORWARD_MSG: IS_DEV ? 0.5 : 1,
  SET_METADATA: IS_DEV ? 0.05 : 1,
  VOTE_FEE: 0.0065,
  BASE: 0.15,
};


