import moment from "moment";
import { Proposal } from "types";

const description = `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.`;
const choices = ["Yes", "No", "Abstain"];
export const proposals: Proposal[] = [
  {
    daoAddress: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
    metadata: {
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
    votes: [],
    proposalResult: {
      yes: 0,
      no: 0,
      abstain: 0,
    },
  },
  {
    daoAddress: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
    metadata: {
      id: 0,
      proposalDeployer: "EQAoNPahsAn7qra-u1489Wd8zgs4SDmReXNscv3Iu4cjYBBf",
      mcSnapshotBlock: 29572110,
      proposalStartTime: moment().subtract(1, "day").unix(),
      proposalEndTime: moment().add(6, "day").unix(),
      proposalSnapshotTime: moment().subtract(2, "day").unix(),
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
      title: '{"en":"Mock proposal 2"}',
      description: JSON.stringify({ en: description }),
    },
    votingPower: {},
    votes: [],
    proposalResult: {
      yes: 0,
      no: 0,
      abstain: 0,
    },
  },
  {
    daoAddress: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
    metadata: {
      id: 0,
      proposalDeployer: "EQAoNPahsAn7qra-u1489Wd8zgs4SDmReXNscv3Iu4cjYBBf",
      mcSnapshotBlock: 29572110,
      proposalStartTime: moment().subtract(10, "day").unix(),
      proposalEndTime: moment().subtract(2, "day").unix(),
      proposalSnapshotTime: moment().subtract(12, "day").unix(),
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
      title: '{"en":"Mock proposal 3"}',
      description: JSON.stringify({ en: description }),
    },
    votingPower: {},
    votes: [],
    proposalResult: {
      yes: 50,
      no: 20,
      abstain: 30,
    },
  },
  {
    daoAddress: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
    metadata: {
      id: 0,
      proposalDeployer: "EQAoNPahsAn7qra-u1489Wd8zgs4SDmReXNscv3Iu4cjYBBf",
      mcSnapshotBlock: 29572110,
      proposalStartTime: moment().subtract(1, "day").unix(),
      proposalEndTime: moment().add(5, "day").unix(),
      proposalSnapshotTime: moment().subtract(2, "day").unix(),
      votingSystem: {
        votingSystemType: 0,
        choices,
      },
      votingPowerStrategies: [
        {
          type: 1,
          arguments: [
            {
              name: "jetton-address",
              value: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
            },
          ],
        },
      ],
      title: '{"en":"Mock proposal 4"}',
      description: JSON.stringify({ en: description }),
    },
    votingPower: {},
    votes: [],
    proposalResult: {
      yes: 50,
      no: 20,
      abstain: 30,
    },
  },
  {
    daoAddress: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
    metadata: {
      id: 0,
      proposalDeployer: "EQAoNPahsAn7qra-u1489Wd8zgs4SDmReXNscv3Iu4cjYBBf",
      mcSnapshotBlock: 29572110,
      proposalStartTime: moment().subtract(1, "day").unix(),
      proposalEndTime: moment().add(5, "day").unix(),
      proposalSnapshotTime: moment().subtract(2, "day").unix(),
      votingSystem: {
        votingSystemType: 0,
        choices,
      },
      votingPowerStrategies: [
        {
          type: 2,
          arguments: [
            {
              name: "nft-address",
              value: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
            },
          ],
        },
      ],
      title: '{"en":"Mock proposal 5"}',
      description: JSON.stringify({ en: description }),
    },
    votingPower: {},
    votes: [],
    proposalResult: {
      yes: 50,
      no: 20,
      abstain: 30,
    },
  },
];
