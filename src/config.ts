import TonConnect from "@tonconnect/sdk";

export const TONSCAN = "https://tonscan.org";
export const TONSCAN_ADDRESS_URL = `${TONSCAN}/address`;

export const BASE_ERROR_MESSAGE = "Oops, something went wrong";

export const APPROVE_TX = "Please check wallet for pending transaction";
export const TX_APPROVED_AND_PENDING = "Transaction pending";
export const TX_FEE = "0.0075";

export const voteOptions = [
  {
    name: "Yes",
    value: "yes",
  },
  {
    name: "No",
    value: "no",
  },
  {
    name: "Abstain",
    value: "abstain",
  },
];

export const manifestUrl = "https://ton.vote/tonconnect-manifest.json";

export const DEFAULT_CLIENT_V2_ENDPOINT =
  "https://toncenter.com/api/v2/jsonRPC";
export const DEFAULT_CLIENT_V4_ENDPOINT = "https://mainnet-v4.tonhubapi.com";


export const CLIENT_V2_API_KEY =
  "3ebe42d62396ff96725e0de9e71cae2916c1b690d3ffc8a80ecd9af4e8fef6f2";



export const STATE_REFETCH_INTERVAL = 30_000;

export const INVALID_ENDPOINT_ERROR = "Invalid endpoint";
export const USER_VOTE_LOCAL_STORAGE = "ton_vote_user_vote";

export const PAGE_SIZE = 20;

export const LOCAL_STORAGE_PROVIDER = "ton_vote_wallet_provider";

export const CLIENT_V4_ENDPOINT = "htyarn dtps://mainnet-v4.tonhubapi.com";
export const LAST_FETCH_UPDATE_LIMIT = 90 * 1000;

export const TX_SUBMIT_ERROR_TEXT = "Transaction failed";
export const TX_SUBMIT_SUCCESS_TEXT = "Transaction completed";

export const VERIFY_LINK =
  "https://github.com/orbs-network/dao-vote#how-can-you-verify-the-results";

export const GITHUB_URL = "https://github.com/orbs-network/dao-vote";
export const GOOGLE_ANALYTICS_KEY = "G-T4FZCJ26VK";

export const PASSWORD = "ton-vote-14-02";

export enum QueryKeys {
  STATE = "STATE",
  PROPOSAL_INFO = "PROPOSAL_INFO",
  PROPOSAL_TIMELINE = "PROPOSAL_TIMELINE",
  DAO_METADATA = "DAO_METADATA",
  DAOS = "DAOS",
  PROPOSALS = "PROPOSALS",
  DAO_ROLES = "DAO_ROLES",
  PROPOSAL = "PROPOSAL",
  SERVER_VALIDATION = "SERVER_VALIDATION",
}

export const APP_TITLE = "TON Vote";
export const FETCH_PROPOSALS_INTERVAL = 30_000;

export const TON_CONNECTOR = new TonConnect({
  manifestUrl,
});


export const DAO_LIMIT = 80;


export const PROPOSALS_LIMIT = 2;
