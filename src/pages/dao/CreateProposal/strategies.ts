import _ from "lodash";
import { StrategyOption } from "./types";

export const STRATEGIES: { [key: string]: StrategyOption } = {
  "ton-balance": { name: "TON coin balance", args: [] },
  "ton-balance-with-amount": {
    name: "TON coin balance, and amount",
    args: [
      {
        type: "number",
        label: "TON amount",
        tooltip: "The amount of TON",
        required: true,
        default: 1,
        placeholder:'Enter TON amount',
      },
    ],
  },
  "jetton-balance": {
    name: "Jetton balance",
    args: [
      {
        type: "text",
        label: "Jetton address",
        tooltip: "The address of the Jetton",
        required: true,
      },
    ],
  },
  "nft-number": {
    name: "Number of owned NFTs",
    args: [
      {
        type: "text",
        label: "NFT collection address",
        tooltip: "The address of the Jetton",
        required: true,
      },
    ],
  },
  "ton-balance-blacklisted": {
    name: "TON balance blacklisted",
    args: [
      {
        type: "list",
        label: "Blacklist",
        tooltip: "The address of the Jetton",
        placeholder: "Enter address",
      },
    ],
  },
};

