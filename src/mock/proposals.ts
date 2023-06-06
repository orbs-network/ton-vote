import _ from "lodash";
import moment from "moment";
import { toNano } from "ton-core";
import {
  VotingPowerStrategy,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { Proposal } from "types";

const description = `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.`;
const choices = ["Yes", "No", "Abstain"];

const VOTES_AMOUNT = 300;


const votingPower = [...Array(VOTES_AMOUNT).keys()].map((i) => {
  return _.random(0, 3000)
});

const votes = [...Array(VOTES_AMOUNT).keys()].map((i) => ({
  address: `EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo-${i + 1}`,
  vote: _.shuffle(choices)[0],
  votingPower: votingPower[i].toString(),
  timestamp: 1685519298,
  hash: "11357872275052426155389012383971883445063156358606972107667992596580446754291",
}));

const total = _.reduce(votingPower, (sum, n) => sum + n, 0);

const defaultProposal = {
  daoAddress: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
  metadata: {
    quorum: "",
    id: 0,
    proposalDeployer: "EQAoNPahsAn7qra-u1489Wd8zgs4SDmReXNscv3Iu4cjYBBf",
    mcSnapshotBlock: 29572110,
    proposalStartTime: moment().add(1, "day").unix(),
    proposalEndTime: moment().add(8, "day").unix(),
    proposalSnapshotTime: moment().subtract(1, "day").unix(),
    votingSystem: {
      votingSystemType: 0,
      choices,
    },
    votingPowerStrategies: [
      {
        type: 0,
        arguments: [],
      },
    ],
    title: JSON.stringify({ en: "Test proposal 1" }),
    description: JSON.stringify({ en: description }),
  },
  votingPower: {},
  votes,
  proposalResult: {
    yes: (
      (_.countBy(votes, (v) => v.vote === "Yes").true / VOTES_AMOUNT) *
      100
    ).toFixed(2),
    no: (
      (_.countBy(votes, (v) => v.vote === "No").true / VOTES_AMOUNT) *
      100
    ).toFixed(2),
    abstain: (
      (_.countBy(votes, (v) => v.vote === "Abstain").true / VOTES_AMOUNT) *
      100
    ).toFixed(2),
    totalWeight: toNano(total),
  },
};

interface CreateProposalArgs {
  title?: string;
  strategyType?: VotingPowerStrategyType;
  description?: string;
}

const getVotingStrategy = (
  type: VotingPowerStrategyType
): VotingPowerStrategy[] => {
  let args;
  switch (type) {
    case VotingPowerStrategyType.JettonBalance:
      return [
        {
          type: VotingPowerStrategyType.JettonBalance,
          arguments: [
            {
              name: "jetton-address",
              value: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
            },
          ],
        },
      ];
    case VotingPowerStrategyType.NftCcollection:
      return [
        {
          type: VotingPowerStrategyType.NftCcollection,
          arguments: [
            {
              name: "nft-address",
              value: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
            },
          ],
        },
      ];
    default:
      return [
        {
          type: VotingPowerStrategyType.TonBalance,
          arguments: [],
        },
      ];
  }
};

const getBaseProposal = (args: CreateProposalArgs) => {
  args.strategyType === VotingPowerStrategyType.TonBalance
    ? []
    : ["EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN"];
  return {
    ...defaultProposal,
    metadata: {
      ...defaultProposal.metadata,
      votingPowerStrategies: getVotingStrategy(args.strategyType || 0),
    },
    title:
      args.title || `Mock proposal ${Math.floor(Math.max(Math.random(), 100))}`,
    description: JSON.stringify({ en: args.description || description }),
  };
};

const activeProposal = (args: CreateProposalArgs): Proposal => {
  const baseProposal = getBaseProposal(args);
  return {
    ...baseProposal,
    metadata: {
      ...baseProposal.metadata,
      proposalStartTime: moment().subtract(1, "day").unix(),
      proposalEndTime: moment().add(1, "day").unix(),
      proposalSnapshotTime: moment().subtract(1, "day").unix(),
    },
  };
};

const pendingProposal = (args: CreateProposalArgs): Proposal => {
  const baseProposal = getBaseProposal(args);

  let metadata = {
    ...baseProposal.metadata,
    proposalStartTime: moment().add(1, "day").unix(),
    proposalEndTime: moment().add(8, "day").unix(),
    proposalSnapshotTime: moment().subtract(1, "day").unix(),
  };
  return {
    ...baseProposal,
    metadata,
  };
};

const endedProposal = (args: CreateProposalArgs) => {
  const baseProposal = getBaseProposal(args);
  return {
    ...baseProposal,
    metadata: {
      ...baseProposal.metadata,
      proposalStartTime: moment().subtract(10, "day").unix(),
      proposalEndTime: moment().subtract(2, "day").unix(),
      proposalSnapshotTime: moment().subtract(11, "day").unix(),
    },
  };
};

export const proposals: Proposal[] = [
  activeProposal({ strategyType: VotingPowerStrategyType.NftCcollection }),
  endedProposal({ strategyType: VotingPowerStrategyType.TonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
  pendingProposal({ strategyType: VotingPowerStrategyType.JettonBalance }),
];
