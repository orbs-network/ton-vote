import _ from "lodash";
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
  DAO_STATE = "DAO_STATE",
  REGISTRY_STATE = "REGISTRY_STATE",
  READ_JETTON_WALLET_METADATA = "READ_JETTON_WALLET_METADATA",
  READ_NFT_ITEM_METADATA = "READ_NFT_ITEM_METADATA",
  WALLET_NFT_COLLECTION_ITEMS = "WALLET_NFT_COLLECTION_ITEMS",
  GET_VERIFIED_DAOS_LIST = "GET_VERIFIED_DAOS_LIST",
}

export const LANGUAGES = { en: "English", ru: "Русский" };

export const releaseMode = import.meta.env.VITE_STAGING
  ? ReleaseMode.DEVELOPMENT
  : ReleaseMode.PRODUCTION;

export const IS_DEV = releaseMode === ReleaseMode.DEVELOPMENT;

export const createDaoDevFee = 0.2;
export const createDaoProdFee = 1.1;

export const TX_FEES = {
  CREATE_DAO: IS_DEV ? createDaoDevFee : 1,
  CREATE_METADATA: IS_DEV ? 0.05 : 0.05,
  FORWARD_MSG: IS_DEV ? 0.25 : 0.25,
  SET_METADATA: IS_DEV ? 0.05 : 0.05,
  VOTE_FEE: 0.01,
  BASE: 0.25,
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
        tooltip: "The address of the NFT collection",
        required: true,
        name: "nft-address",
      },
    ],
  },
  [VotingPowerStrategyType.TonBalance_1Wallet1Vote]: {
    name: "TON coin balance, 1 wallet 1 vote",
    args: [],
  },
  [VotingPowerStrategyType.JettonBalance_1Wallet1Vote]: {
    name: "Jetton balance, 1 wallet 1 vote",
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
  [VotingPowerStrategyType.NftCcollection_1Wallet1Vote]: {
    name: "Number of owned NFTs, 1 wallet 1 vote",
    args: [
      {
        type: "text",
        label: "NFT collection address",
        tooltip: "The address of the NFT collection",
        required: true,
        name: "nft-address",
      },
    ],
  },
  [VotingPowerStrategyType.ValidatorsVote]: {
    name: "Validators",
    args: [
      {
        type: "text",
        label: "Hash",
        tooltip: "",
        required: true,
        name: "validators-proposal-hash",
      },
    ],
  },
};

export const STRATEGY_ARGUMENTS = [
  { name: "jetton", key: "jetton-address" },
  { name: "nft", key: "nft-address" },
  { name: "validators-proposal-hash", key: "validators-proposal-hash" },
];

export const TELEGRAM_SUPPORT_GROUP = "https://t.me/TONVoteSupportGroup/82";
export const PROD_TEST_DAOS: string[] = [];

export const REFETCH_INTERVALS = {
  proposal: 15_000,
  dao: 60_000,
  daos: 60_000,
};

export const API_RETRIES = 2;
export const CONTRACT_RETRIES = 2;

export const RETRY_DELAY = 1000;

export const BLACKLISTED_DAOS = [
  "EQAQiTI1QkaCpIYAqdEO4mRTIzACq7WNlhNzt2voUnE4qxKy",
];
export const BLACKLISTED_PROPOSALS = [
  "EQAGgwt5WA6fBcD_OgEKXOEDLjto5X9SyOmOP-NOrn19sxtZ",
];
