import { Proposal } from "types";
import dora from "./dora.json";
import tokenomics from "./tokenomics.json";
import realTimeBurn from "./real-time-burn.json";

import {TOKENOMICS_ABOUT, DORA_HACKS_ABOUT} from './about'
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";


export const FOUNDATION_DAO_ADDRESS =
  "EQCb8dxevgHhBnsTodJKXaCrafplHzAHf1V2Adj0GVlhA5xI";
export const OLD_FOUNDATION_ADDRESS =
  "EQC5E53rXLTWHzsYAdudAG3p6n45c0MuvoKDCGDFnu4OmuMb";
export const FOUNDATION_PROPOSALS_ADDRESSES = [
  "EQAx5JjTHpQ_5EeWBAErl4_AWhh_JFBh2UvuTWAeqdbpC0C1",
  "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
  "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS",
];
export const FOUNDATION_PROPOSALS: { [key: string]: Proposal } = {
  "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr": {
    daoAddress: FOUNDATION_DAO_ADDRESS,
    metadata: {
      hide: false,
      quorum: "",
      id: 0,
      proposalDeployer: "EQDmbwKbzpuuPacqcX67UAjQ3o6WqEjQ4_Mwvr5Ci524vO60",
      mcSnapshotBlock: 28390698,
      proposalStartTime: 1680098400,
      proposalEndTime: 1680195600,
      proposalSnapshotTime: 1680012000,
      votingSystem: {
        choices: [
          "DeDust",
          "Punk City",
          "Evaa",
          "1ton",
          "Nujan IDE",
          "re:doubt",
          "Tsunami Exchange",
          "Tonic Lounge",
          "TonEase",
          "Genlock",
        ],
        votingSystemType: 0,
      },
      votingPowerStrategies: [
        { type: VotingPowerStrategyType.TonBalance, arguments: [] },
      ],
      title: "Hack-a-TONx: Choose your winners!",
      description: DORA_HACKS_ABOUT,
    },
    votes: dora.votes,
    proposalResult: dora.proposalResult.proposalResult,
    url: "https://ton.vote",
    sumCoins: dora.proposalResult.sumCoins,
    sumVotes: dora.proposalResult.sumVotes,
    rawVotes: {},
  },
  "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS": {
    daoAddress: FOUNDATION_DAO_ADDRESS,
    metadata: {
      hide: false,
      quorum: "",
      id: 0,
      proposalDeployer: "EQDmbwKbzpuuPacqcX67UAjQ3o6WqEjQ4_Mwvr5Ci524vO60",
      mcSnapshotBlock: 27280026,
      proposalStartTime: 1676379600,
      proposalEndTime: 1676984400,
      proposalSnapshotTime: 1676160000,
      votingSystem: {
        choices: ["Yes", "No", "Abstain"],
        votingSystemType: 0,
      },
      votingPowerStrategies: [
        { type: VotingPowerStrategyType.TonBalance, arguments: [] },
      ],
      title: "Proposal of TON Tokenomics Optimization",
      description: TOKENOMICS_ABOUT,
    },
    rawVotes: {},
    votingPower: tokenomics.votingPower,
    votes: tokenomics.votes,
    proposalResult: tokenomics.proposalResults,
    url: "https://ton.vote/frozen",
  },
  // "EQAx5JjTHpQ_5EeWBAErl4_AWhh_JFBh2UvuTWAeqdbpC0C1": {
  //   ...realTimeBurn,
  //   rawVotes: {},
    
  // },
};
