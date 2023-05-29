import { Dao, Proposal } from "types";
import dora from "./dora.json";
import tokenomics from "./tokenomics.json";
import {TOKENOMICS_ABOUT, DORA_HACKS_ABOUT} from './about'
import FoundationImg from "assets/foundation.png";
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";


export const FOUNDATION_DAO: Dao = {
  daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
  daoId: 0,
  daoMetadata: {
    metadataAddress: "",
    metadataArgs: {
      about: "Some description",
      avatar: FoundationImg,
      github: "",
      hide: false,
      name: "TON Foundation",
      terms: "",
      telegram: "https://t.me/toncoin_chat",
      website: "https://ton.org/",
      jetton: "",
      nft: "",
      dns: "foundation.ton",
    },
  },
  daoRoles: {
    owner: "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N",
    proposalOwner: "",
  },
  daoProposals: [
    "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
    "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS",
  ],
};

export const proposals: { [key: string]: Proposal } = {
  "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr": {
    daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
    metadata: {
      quorum: "",
      id: 0,
      proposalDeployer: "EQDmbwKbzpuuPacqcX67UAjQ3o6WqEjQ4_Mwvr5Ci524vO60",
      mcSnapshotBlock: 28390698,
      proposalStartTime: 1680098400,
      proposalEndTime: 1680195600,
      proposalSnapshotTime: 1680012000,
      votingSystem: {
        choices: [],
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
  },
  "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS": {
    daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
    metadata: {
      quorum: "",
      id: 0,
      proposalDeployer: "EQDmbwKbzpuuPacqcX67UAjQ3o6WqEjQ4_Mwvr5Ci524vO60",
      mcSnapshotBlock: 27280026,
      proposalStartTime: 1676379600,
      proposalEndTime: 1676984400,
      proposalSnapshotTime: 1676160000,
      votingSystem: {
        choices: [],
        votingSystemType: 0,
      },
      votingPowerStrategies: [
        { type: VotingPowerStrategyType.TonBalance, arguments: [] },
      ],
      title: "Proposal of TON Tokenomics Optimization",
      description: TOKENOMICS_ABOUT,
    },
    votingPower: tokenomics.votingPower,
    votes: tokenomics.votes,
    proposalResult: tokenomics.proposalResults,
    url: "https://ton.vote/frozen",
  },
};
