import TonKeeperLogo from "assets/tonkeeper.png";
import TonhubLogo from "assets/tonhub.png";
import ExtensionLogo from "assets/chrome.svg";

import { Provider, WalletProvider } from "types";

export const TONSCAN = "https://tonscan.org";
export const TONSCAN_ADDRESS_URL = `${TONSCAN}/address`;

export const BASE_ERROR_MESSAGE = "Oops, something went wrong";

export const APPROVE_TX = "Please check wallet for pending transaction";
export const TX_APPROVED_AND_PENDING = "Transaction pending";
export const TX_FEE = "0.015";

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
    type: Provider.EXTENSION,
    icon: ExtensionLogo,
    title: "Google Chrome Plugin",
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

export const TRANSACTIONS_DATA_REFECTH_INTERVAL = 30_000

export const INVALID_ENDPOINT_ERROR = "Invalid endpoint";
