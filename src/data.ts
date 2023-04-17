import { ProposalResult } from "ton-vote-sdk";
import { Proposal } from "types";

export const OLD_DAO = {
  daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
  daoId: 0,
  daoMetadata: {
    about: "https://reactdatepicker.com/",
    avatar: "https://www.orbs.com/assets/img/common/logo.svg",
    github: "https://reactdatepicker.com/",
    hide: false,
    name: "Take from ami",
    terms: "https://reactdatepicker.com/",
    twitter: "https://reactdatepicker.com/",
    website: "https://reactdatepicker.com/",
  },
  daoRoles: {
    owner: "",
    proposalOwner: "",
  },
  nextProposalId: 2,
  daoProposals: [
    "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
    "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS",
  ],
};

export const proposals: { [key: string]: Proposal } = {
  "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr": {
    daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
    metadata: {
      id: 0,
      owner: "EQDmbwKbzpuuPacqcX67UAjQ3o6WqEjQ4_Mwvr5Ci524vO60",
      mcSnapshotBlock: 28390698,
      proposalStartTime: 1680098400,
      proposalEndTime: 1680195600,
      proposalSnapshotTime: 1680012000,
      proposalType: 1,
      votingPowerStrategy: 1,
      title: "Hack-a-TONx: Choose your winners!",
      description:
        "The grand finale of the Hack-a-TONx w/ DoraHacks is finally here - It is now time for the community to vote on the winning projects and distribute the $300,000 pool prize!",
    },
    votingPower: {},
    votes: [],
    proposalResult: {} as ProposalResult,
    hardcoded: true,
    url: "https://ton.vote",
  },
  "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS": {
    daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
    metadata: {
      id: 0,
      owner: "EQDmbwKbzpuuPacqcX67UAjQ3o6WqEjQ4_Mwvr5Ci524vO60",
      mcSnapshotBlock: 27280026,
      proposalStartTime: 1676379600,
      proposalEndTime: 1676984400,
      proposalSnapshotTime: 1676160000,
      proposalType: 1,
      votingPowerStrategy: 1,
      title: "Proposal of TON Tokenomics Optimization",
      description:
        "Tokenomics proposal to achieve community consensus on circulating supply of TON. Proposal for a 48 month temporary freeze of inactive mining wallets, which have never been activated and do not have any outgoing transfer in their history.",
    },
    votingPower: {},
    votes: [],
    proposalResult: {} as ProposalResult,
    hardcoded: true,
    url: "https://ton.vote/frozen",
  },
};
