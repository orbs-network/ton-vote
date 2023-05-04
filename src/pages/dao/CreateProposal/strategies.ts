import _ from "lodash";
import { StrategyOption } from "./types";

export const STRATEGIES: { [key: string]: StrategyOption } = {
  "ton-balance": { name: "TON coin balance", args: [] },
  "jetton-balance": {
    name: "Jetton balance",
    args: [
      {
        type: "text",
        label: "Jetton address",
        name: "jetton",
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
        name: "nft",
        tooltip: "The address of the Jetton",
        required: true,
      },
    ],
  },
  "ton-balance-blacklisted": {
    name: "TON balance blacklisted",
    args: [
      {
        type: 'list',
        label: "Blacklist",
        name: "blacklist",
        tooltip: "The address of the Jetton",
        required: true,
        placeholder:'Enter address'
      },
    ],
  },
};

