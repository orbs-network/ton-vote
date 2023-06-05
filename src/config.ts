import { ReleaseMode, VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { StrategyOption } from "types";
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
  DAO_STATE = 'DAO_STATE',
  REGISTRY_STATE = 'REGISTRY_STATE',
}


export const DAO_REFETCH_INTERVAL = 20_000;
export const DAOS_PAGE_REFETCH_INTERVAL = 20_000;
export const LANGUAGES = { en: "English", ru: "Русский" };

export const VERIFIED_DAOS = [
  "EQBcWmVMuby9kFuB0bAyLQpDvCeosTX3h4m7lct0c8GI8QOG",
  "EQCxbXzrtDQ9ZHvFL91xnCm6YtFYO1Lks9tImMHJHVICKD9X",
  "EQD4GRGo2Exp0yt3L9-2TW7KPM8GK5gzyhJ1tEweIVz4jIQY",
  "EQCEnW_oq1RmMJ4ciTTsccLIzu2vy0VVLo_hfa84tZZfh_Qy",
  "EQC5E53rXLTWHzsYAdudAG3p6n45c0MuvoKDCGDFnu4OmuMb",
];

export const releaseMode = import.meta.env.VITE_STAGING
  ? ReleaseMode.DEVELOPMENT
  : ReleaseMode.PRODUCTION;

export const IS_DEV =
  releaseMode === ReleaseMode.DEVELOPMENT

export const TX_FEES = {
  CREATE_DAO: IS_DEV ? 0.085 : 1,
  CREATE_METADATA: IS_DEV ? 0.05 : 1,
  FORWARD_MSG: IS_DEV ? 0.25 : 1,
  SET_METADATA: IS_DEV ? 0.05 : 1,
  VOTE_FEE: 0.01,
  BASE: 0.05,
};





export const STRATEGIES: { [key: number]: StrategyOption<any> } = {
  [VotingPowerStrategyType.TonBalance]: { name: "TON coin balance", args: [] },
  [VotingPowerStrategyType.JettonBalance]: {
    name: "Jetton balance",
    args: [
      {
        type: "text",
        label: "Jetton address",
        tooltip: "The address of the Jetton",
        required: true,
        name: "jetton-address",
      },
    ],
  },
  [VotingPowerStrategyType.NftCcollection]: {
    name: "Number of owned NFTs",
    args: [
      {
        type: "text",
        label: "NFT collection address",
        tooltip: "The address of the Jetton",
        required: true,
        name: "nft-address",
      },
    ],
  },
};



export const PROD_TEST_DAOS: string[] = []