import { Dao, Proposal } from "types";


export const OLD_DAO: Dao = {
  daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
  daoId: 0,
  daoMetadata: {
    about: "Some description",
    avatar: "https://www.orbs.com/assets/img/common/logo.svg",
    github: "https://reactdatepicker.com/",
    hide: false,
    name: "Take from ami",
    terms: "https://reactdatepicker.com/",
    telegram: "https://reactdatepicker.com/",
    website: "https://reactdatepicker.com/",
    jetton:'',
    nft:''
  },
  daoRoles: {
    owner: "",
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
      id: 0,
      owner: "EQDmbwKbzpuuPacqcX67UAjQ3o6WqEjQ4_Mwvr5Ci524vO60",
      mcSnapshotBlock: 28390698,
      proposalStartTime: 1680098400,
      proposalEndTime: 1680195600,
      proposalSnapshotTime: 1680012000,
      votingSystem: {
        choices: [],
        votingSystemType: 0,
      },
      votingPowerStrategy: 1,
      title: "Hack-a-TONx: Choose your winners!",
      description:
        "The grand finale of the Hack-a-TONx w/ DoraHacks is finally here - It is now time for the community to vote on the winning projects and distribute the $300,000 pool prize!",
      jetton: "",
      nft: "",
    },
    votingPower: {},
    votes: [],
    proposalResult: {
      "Tsunami Exchange": 8.81,
      "1ton": 10.63,
      Genlock: 8.16,
      "Tonic Lounge": 8.81,
      DeDust: 13.69,
      "Nujan IDE": 9.76,
      TonEase: 8.47,
      Evaa: 11.22,
      "re:doubt": 9.14,
      "Punk City": 11.3,
      totalWeight: "765328780229858",
    },

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
      votingSystem: {
        choices: [],
        votingSystemType: 0,
      },
      votingPowerStrategy: 1,
      title: "Proposal of TON Tokenomics Optimization",
      description:
        "Tokenomics proposal to achieve community consensus on circulating supply of TON. Proposal for a 48 month temporary freeze of inactive mining wallets, which have never been activated and do not have any outgoing transfer in their history.",
      jetton: "",
      nft: "",
    },
    votingPower: {},
    votes: [],
    proposalResult: {
      yes: 91.75,
      no: 8.09,
      abstain: 0.16,
      totalWeight: "1824494647320919",
    },
    url: "https://ton.vote/frozen",
  },
};
