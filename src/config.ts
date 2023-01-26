import TonKeeperLogo from "assets/tonkeeper.png";
import TonhubLogo from "assets/tonhub.png";
import ExtensionLogo from "assets/chrome.svg";

import { Provider, WalletProvider } from "types";

export const TONSCAN = "https://tonscan.org";
export const TONSCAN_ADDRESS_URL = `${TONSCAN}/address`;

export const BASE_ERROR_MESSAGE = "Oops, something went wrong";

export const APPROVE_TX = 'Please check wallet for pending transaction'
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
