import { Dao, Proposal } from "types";
import dora from "../foundation/dora.json";
import FoundationImg from "assets/foundation.png";

const doraHacksAbout = `
The grand finale of the Hack-a-TONx w/ DoraHacks is finally here -

It is now time for the community to vote on the winning projects and distribute the $300,000 pool prize!

2 months have passed since the launch of the first ever TON global hackathon. During this time, 234 submissions have been received from top-quality teams who chose to Build-on-TON. After a thorough review process, the panel of Hack-a-TONx judges chose 10 projects to proceed to the grand finale.

Each voter can vote for his top 5 favorite projects, in no particular order and the voting power will be splitted equally between the projects. All in all, 5 winning projects will be chosen, ranked by the total amount of votes they receive.

The community vote will account for 20% of the decision on the final winning teams, so choose wisely!

Before you cast your vote, be sure to check out the following:

-   Demo day 1 live judging (Tsunami Exchange, 1ton, Genlock, Tonic Lounge, DeDust): [Link](https://www.youtube.com/watch?v=kZWvJCGJ9Js)
-   Demo day 2 live judging (Nujan IDE, TonEase, Evaa Protocol, re:doubt, Punk City): [Link](https://www.youtube.com/watch?v=hgcKkpvGDp0)

And the finalists are...

1.   Tsunami Exchange: Tsunami - Trade Everything on TON including Crypto, Stock, Commodities & Forex! [Learn more](https://dorahacks.io/buidl/4511)
2.   1ton: 1TON Finance empowers unbanked creators to achieve their financial goals and thrive in their businesses. [Learn more](https://dorahacks.io/buidl/4580)
3.   Genlock: Web service that uses Generative AI technologies to generate unique game assets as NFT. [Learn more](https://dorahacks.io/buidl/4562)
4.   Tonic Lounge: Build and Find Your Token Gated Telegram Community with Tonic Lounge and Tonic Wallet. [Learn more](https://dorahacks.io/buidl/4521)
5.   DeDust: Hub for managing DeFi assets [Learn more](https://dorahacks.io/buidl/4158)
6.   Nujan IDE: To make the development process on TON smooth, frictionless, and convenient. We aim to minimize the barrier to entry for developers who are coming on a TON. [Learn more](https://dorahacks.io/buidl/4473)
7.   TonEase: Streamline your payments with TonEase - the all-in-one solution for batch, date-specific, and recurring payments. [Learn more](https://dorahacks.io/buidl/4492)
8.   Evaa: he first decentralized lending protocol on TON that lets users lend or borrow native and wrapper assets without going to a centralized intermediary. [Learn more](https://dorahacks.io/buidl/4093)
9.   re:doubt: Real-time security & operational monitoring. [Learn more](https://dorahacks.io/buidl/4157)
10.   Punk City: A metaverse of Play-2-Earn games in telegram. [Learn more](https://dorahacks.io/buidl/4557)

Any holder of TONCoin is eligible to vote. The vote will open on March 29, 2023 at 2:00 PM GMT and close on March 30, 2023 at 5:00 PM.

`;

export const OLD_DAO: Dao = {
  daoAddress: "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
  daoId: 0,
  daoMetadata: {
    about: "Some description",
    avatar: FoundationImg,
    github: "https://reactdatepicker.com/",
    hide: false,
    name: "TON Foundation",
    terms: "https://reactdatepicker.com/",
    telegram: "https://reactdatepicker.com/",
    website: "https://ton.org/",
    jetton: "",
    nft: "",
    dns: "foundation.ton",
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
      votingPowerStrategy: 0,
      title: "Hack-a-TONx: Choose your winners!",
      description:doraHacksAbout,
      jetton: "",
      nft: "",
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
      votingPowerStrategy: 0,
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
