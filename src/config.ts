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
}

export const LANGUAGES = { en: "English", ru: "Русский" };

export const VERIFIED_DAOS = [
  "EQBcWmVMuby9kFuB0bAyLQpDvCeosTX3h4m7lct0c8GI8QOG",
  "EQCxbXzrtDQ9ZHvFL91xnCm6YtFYO1Lks9tImMHJHVICKD9X",
  "EQD4GRGo2Exp0yt3L9-2TW7KPM8GK5gzyhJ1tEweIVz4jIQY",
  "EQCEnW_oq1RmMJ4ciTTsccLIzu2vy0VVLo_hfa84tZZfh_Qy",
  "EQC5E53rXLTWHzsYAdudAG3p6n45c0MuvoKDCGDFnu4OmuMb",
  "EQCVwkPuxX7sVe_ajaYIQgsrXTCmQJmEf1LemIbl_OWC3_wF",
  "EQAPWMrbP0K4yVvqqYdynUoelX-I6rDvWRmWJNFDchB4cUPW",
  "EQCBefq4_WZfIBnyVrBeAp2BNJMBqQSLpWN3q53GLgX5zU-C",
  "EQC5uEjI6iCQcjmoFh2KcUIUsQ7hb17hnK29NoEwtqTjEdlO",
  "EQDspA6XZrai7c5cuCUvGw1wfMuOdXvBSYuc8q8us94fs3Zw",
  "EQC75Z49OlHwFvSfa21FMfSe6jMdY4SccRHsGljJR6229u2T",
  "EQCb8dxevgHhBnsTodJKXaCrafplHzAHf1V2Adj0GVlhA5xI",
  "EQBSnMyKtNlgmlcgRMrQlHH_asDSRV8jmtpbHZqM6sWp1YYp",
  "EQCjkyH0rAibDNadPUoD5nyEdUc_QACmaLyOuuyro3vo8sRV",
  "EQCrdt_vPS_0pJRXl-Y4aNHsq7TYLmXEOSe3PUD2u3g1klC9",
  "EQC79CMqa1DsK43p9vv-6cuxX-hRCTKtdog-YlVjN-t03TNY",
  "EQB3u9vIjt2Cd4hmb1LruFeU44SwaaMM0ox8uKv8iEs7trWH",
  "EQD2lFs-kxU0VLyDDhNO0XyH7OrBpJHIbMayBqoUtJ4Xb4eq",
  "EQAY-sgFKzGrXO6_0785Et6nMVPK78aJUqaMhR7jwzsEDssX",
  "EQAYBkVlx1li1qg8d4S_6T0fvxFDFiiKzgxQouIGxQJck2C0",
  "EQAY-sgFKzGrXO6_0785Et6nMVPK78aJUqaMhR7jwzsEDssX",
  "EQAYBkVlx1li1qg8d4S_6T0fvxFDFiiKzgxQouIGxQJck2C0",
  "EQDh8EdtTVVUuL50A2p-bzJk1Q9qAVK5fSIyCZ7RwktPwxAN",
  "EQAvYNurOKXnv2ASweTgbdYavcaxnsbZeXXhdJkkvMicOLoZ",
  "EQDI_7Nk7Fe43pilkdt8rh1Ryl8P8d6-8eieCGVs1p6MYkCF",
  "EQCbE-S_Bl4l8CgvosBDEnLDwTgz0qmScodUFt3YeE5JziM5",
  "EQBmv0LIG56PLOETKV_-Bz5apBMND3gA9BEaysGIluaoHv5i",
  "EQAjz0zyH8esx1joXuDzJ8NTrA7Xmjn6DQVcqZmM1zHwpsLD",
  "EQATOALRdF-1caUrqNRW3NKfoXHFqO_a_tcIIMBNYCqTI1fG",
  "EQCsKT7341lTP1BEV9dFzcgjJv8wCdCqpvtoK2c18zO2e5GE",
  "EQBM94_9VlmsBbKwbjd1FQgNl9zZLl0cUgBGochRANNZpUzf",
  "EQBvInxcrQhZxeIqA28s6KLYHmS2GrBcTIrX1oMPNoZpOMaQ",
  "EQCWwLjY-EvuyLY-b8IzeLQdSsY6pOBczwNAK1DBZ8oUStOn",
  "EQBRYj_HUAQ_ALMxqEcJ3cNsfp1fdtxjixOlANSVm6l5_3K8",
  "EQAdSeBuh5M3W5fg4-Yh6TX9p4CELLRpFHp43vUQYajPXQg_",
  "EQBEC1-B3e-CqFqBWrkPM-sIT9tsN1rarIPpg3E-LPecB5SC",
  "EQCVWiKn2KI4fukFxkSG-Z9Abw0s0NJOomO6h8V1oG55nbyp",
  "EQC2qRI50MAPlqqyjCz1TXrehFGVLnQ1CSv6PX5RyZju55eB",
  "EQDv3VVbwaNwqIzn_EVb_dygJGj-AM9CZ80ZnkG8K_k48r-9",
  "EQA3l_oa8lEgROi3GAhxLmt0nlQZoxQu6zRb1_mfIOEwZzYB",
  "EQAk1OALwQY5zG7ugmio1gLJWvuyVCAIPJ-hztv2XOEmbdic",
  "EQC1CPNQ9rTQ8S7hHMIgMYLYWFha_PgKeeueRf6NuCqWaXpS",
  "EQB7PgREXjf7OX9snt5a2ZBbCAPV-7jZoLmmEw4GZ38J8Qbs",
  "EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv",
  "EQAjfm4fGAL1dTQjdSPcIEe3IeI_3UCUeVanUmrqlW6kGktj",
  "EQC350MT2SiMLBk7oMnJ7hpWY_PGkILYrDrqGn-gjfIZW6pZ"
];

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
  [VotingPowerStrategyType.TonBalanceWithValidators]: {
    name: "TON coin balance, with validators",
  },
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
};

export const STRATEGY_ARGUMENTS = [
  { name: "jetton", key: "jetton-address" },
  { name: "nft", key: "nft-address" },
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
  "EQBndiSBQjwz3Jx69iz3wopRobVWMTHsex4EW2RFqn-XiBbL",
  "EQBA4-38O2z4KYhh0H2543cn7VnomsdVq2h7KBnhQvwqRf9R",
  "EQArg7OZrwgcjIcEbIBZeX_P_Dh2hVTZwaDumvK615_HG--r",
  "EQBDk9Pg0UZsDTMSX0Q7vZkaPn6tdM44f2DUi6-HnnY4Pfre",
  "EQDVAAlbnYXpS7yNHfK27lhZa5RWS9_ZjIwBF-hqOYZm_qAK"
];
export const BLACKLISTED_PROPOSALS = [
  "EQAGgwt5WA6fBcD_OgEKXOEDLjto5X9SyOmOP-NOrn19sxtZ",
  "EQCHZNmiqQvgbToCjuqwGJuiw7OEbQYuY6T5Wv4dNnYeZ8XW"
];
