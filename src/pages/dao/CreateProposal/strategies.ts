import _ from "lodash";
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { StrategyOption } from "./types";

export const STRATEGIES: { [key: number]: StrategyOption } = {
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
