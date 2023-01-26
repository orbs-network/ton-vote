import TonKeeperLogo from "assets/tonkeeper.png";
import TonhubLogo from "assets/tonhub.png";
import ExtensionLogo from "assets/chrome.svg";

import { Provider, WalletProvider } from "types";


export const walletAdapters: WalletProvider[] = [
  {
    type: Provider.TONKEEPER,
    icon: TonKeeperLogo,
    title: "Tonkeeper",
    description: "A Non-custodial cryptocurrency wallet",
  },
  {
    type: Provider.TONHUB,
    icon: TonhubLogo,
    title: "Tonhub",
    description: "A mobile wallet in your pocket",
  },
  {
    type: Provider.EXTENSION,
    icon: ExtensionLogo,
    title: "Google Chrome Plugin",
    description: "TON Wallet Plugin for Google Chrome",
    mobileDisabled: true,
  },
];
