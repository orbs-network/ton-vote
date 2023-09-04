import { Proposal } from "types";

export const mockProposal: Proposal = {
  daoAddress: "EQAaVBW9FUcZm9Oyb1U883AB8-DAu4wLpBPaXQuNPm5RXsR7",
  metadata: {
    id: 5,
    proposalDeployer: "EQB4znwwFog7vYtGgbjd7NlFWcqp1b7_rihCqzOMIa3nMs-a",
    mcSnapshotBlock: 30613080,
    proposalStartTime: 1687776840,
    proposalEndTime: 1688396400,
    proposalSnapshotTime: 1687651200,
    votingSystem: { votingSystemType: 0, choices: [] },
    votingPowerStrategies: [],
    title: '{"en":"ton balance 1 wallet"}',
    description: '{"en":"ton balance 1 wallet"}',
    quorum: "",
    hide: false,
  },
  votingPower: {
    "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo": "1",
    EQCBrRdawVLx66y2O7qYPqrFmd9jUCDbR8bXjC4m1SymwhnV: "1",
  },
  votes: [
    {
      address: "EQCBrRdawVLx66y2O7qYPqrFmd9jUCDbR8bXjC4m1SymwhnV",
      vote: "Yes",
      votingPower: "0.000000001",
      timestamp: 1687786573,
      hash: "107896869026053536941350144713661000770096413450965489082149388326400055047380",
    },
    {
      address: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      vote: "Abstain",
      votingPower: "0.000000001",
      timestamp: 1687777058,
      hash: "43090762579249242116595047746066114083623294711757948430087588797829025758484",
    },
  ],
  proposalResult: { yes: 50, no: 0, abstain: 50, totalWeight: "2" },
  maxLt: "38798997000003",
  rawVotes: {
    "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo": {
      timestamp: 1687777058,
      vote: "Abstain",
      hash: "43090762579249242116595047746066114083623294711757948430087588797829025758484",
    },
    EQCBrRdawVLx66y2O7qYPqrFmd9jUCDbR8bXjC4m1SymwhnV: {
      timestamp: 1687786573,
      vote: "Yes",
      hash: "107896869026053536941350144713661000770096413450965489082149388326400055047380",
    },
  },
};
