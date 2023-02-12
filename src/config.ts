import TonKeeperLogo from "assets/tonkeeper.png";
import TonhubLogo from "assets/tonhub.png";
import ExtensionLogo from "assets/chrome.svg";
import OpenMaskLogo from "assets/openmask.svg";

import { Provider, WalletProvider } from "types";
import { Address } from "ton";

export const TONSCAN = "https://tonscan.org";
export const TONSCAN_ADDRESS_URL = `${TONSCAN}/address`;

export const BASE_ERROR_MESSAGE = "Oops, something went wrong";

export const APPROVE_TX = "Please check wallet for pending transaction";
export const TX_APPROVED_AND_PENDING = "Transaction pending";
export const TX_FEE = "0.0075";

export const walletAdapters: WalletProvider[] = [
  {
    type: Provider.TONKEEPER,
    icon: TonKeeperLogo,
    title: "Tonkeeper",
    description: "A Non-custodial cryptocurrency wallet",
    reminder: true,
  },
  {
    type: Provider.TONHUB,
    icon: TonhubLogo,
    title: "Tonhub",
    description: "A mobile wallet in your pocket",
    reminder: true,
  },

  {
    type: Provider.OPEN_MASK,
    icon: OpenMaskLogo,
    title: "OpenMask",
    description: "OpenMask Plugin for Google Chrome",
    mobileDisabled: true,
  },
  {
    type: Provider.EXTENSION,
    icon: ExtensionLogo,
    title: "TON Wallet",
    description: "TON Wallet Plugin for Google Chrome",
    mobileDisabled: true,
  },
];

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



export const DEFAULT_ENDPOINTS = {
  v2: "https://toncenter.com/api/v2/jsonRPC",
  // v2: "https://scalable-api.tonwhales.com/jsonRPC",
  v4: "https://mainnet-v4.tonhubapi.com",
};


export const ENDPOINT_INPUTS = {
  clientV2: {
    name: "clientV2Endpoint",
    label: "HTTP v2 endpoint",
    defaut: DEFAULT_ENDPOINTS.v2,
  },
  apiKey: {
    name: "apiKey",
    label: "HTTP v2 API key",
    default: "3ebe42d62396ff96725e0de9e71cae2916c1b690d3ffc8a80ecd9af4e8fef6f2",
    // default:''
  },

  clientV4: {
    name: "clientV4Endpoint",
    label: "HTTP v4 endpoint",
    defaut: DEFAULT_ENDPOINTS.v4,
  },
};


export const STATE_REFETCH_INTERVAL = 30_000

export const INVALID_ENDPOINT_ERROR = "Invalid endpoint";
export const USER_VOTE_LOCAL_STORAGE = 'ton_vote_user_vote'

export const PAGE_SIZE = 10

export const LOCAL_STORAGE_PROVIDER = "ton_vote_wallet_provider";


export const CLIENT_V4_ENDPOINT = "https://mainnet-v4.tonhubapi.com";
export const LAST_FETCH_UPDATE_LIMIT = 90 * 1000;

export const TX_SUBMIT_ERROR_TEXT = 'Transaction failed'
export const TX_SUBMIT_SUCCESS_TEXT = 'Transaction completed'


export const CONTRACT_ADDRESS = Address.parse(
  "EQANFJgI3ahDXtSXEGkWYNR7Lqr6dBrVtrCTem5_DuQtTcDT"
);


export const VERIFY_LINK =
  "https://github.com/orbs-network/dao-vote#how-can-you-verify-the-results";

export const GITHUB_URL = "https://github.com/orbs-network/dao-vote";
export const GOOGLE_ANALYTICS_KEY = "G-T4FZCJ26VK";