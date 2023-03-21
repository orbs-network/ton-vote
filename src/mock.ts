import _, { shuffle } from "lodash";
import moment from "moment";
import { Address } from "ton";
import {
  DaoMetadata,
  DaoProposal,
  DaoProposalMetadata,
  DapProposalMetadata,
  GetDaoProposals,
  GetDaos,
} from "types";
import { makeElipsisAddress } from "utils";

const addresses = [
  "EQAnOgaTMcdWIE4G4btaz5I-2AUdj_ajtrvwmyBc7FKoooGG",
  "EQB5_SSILhGXMLBPIE2QbTZoaPHBzwK4Z1Ek9kigqQ_mwImE",
  "EQDUSJ7EfT6Wuy1Is2NgMMpMAI4FzHS1Q8nw9a5ZRqiC0Xlu",
  "EQBTCgbs6dOyLI2qmyDfLPm2YBWj45eL7B57DERGVWAErchd",
  "EQCajaUU1XXSAjTD-xOV7pE49fGtg4q8kF3ELCOJtGvQFQ2C",
];

export const getDaos = (): GetDaos => {
  return {
    endDaoId: BigInt(0),
    daoAddresses: _.range(0, 5).map((it, i) => {
      const address = _.first(_.shuffle(addresses));
      return Address.parse(address!);
    }),
  };
};

export const getDaoRoles = (daoAddress: string) => {
  return {
    owner: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
    proposalOwner: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
    id: daoAddress,
  };
};

export const createDaoMetadata = (daoAddress: string): DaoMetadata => {
  return {
    about: "about",
    avatar: `https://picsum.photos/id/${_.random()}/200/200`,
    github: "/",
    hide: false,
    name: daoAddress,
    terms: "/",
    twitter: "/",
    website: "/",
  };
};

const start = [
  moment().subtract(7, "days").unix().valueOf(),
  moment().add(2, "days").unix().valueOf(),
  moment().subtract(6, "days").unix().valueOf(),
  moment().subtract(5, "days").unix().valueOf(),
];

const end = [
  moment().subtract(2, "days").unix().valueOf(),
  moment().add(12, "days").unix().valueOf(),
  moment().add(2, "days").unix().valueOf(),
  moment().add(5, "days").unix().valueOf(),
];

export const getProposals = (daoAddress: string): GetDaoProposals => {
  return {
    endProposalId: BigInt(0),
    proposalAddresses: _.range(0, 5).map((e, i) => {
      return Address.parse(`${daoAddress}-${i}`);
    }),
  };
};

export const getProposalMetadata = (
  daoAddress: string,
  proposalAddress: string
): DaoProposalMetadata => {
  return {
    title: "Some title",
    description: "Some description",
    owner: daoAddress,
  };
};

export const createProposals = (amount: number): DaoProposal[] => {
  return _.range(0, amount).map((it, i) => {
    function isEven(n: number) {
      return n % 4 == 0;
    }
    const startDate = _.shuffle(start)[0];
    const endDate = _.shuffle(end)[0];
    return {
      title: `Proposal ${i++}`,
      description: `GSR is operating as normal and remains focused on maintaining liquidity for our clients despite the market events of last year. As standard practice we proactively manage our exposures to all exchanges and reduce dynamically where necessary. GSR is well-positioned to navigate the high volatility and continues to actively deploy capital to maintain healthy liquidity in both private and listed linear and nonlinear products in the space.`,
      ownerAvatar: `https://picsum.photos/id/${i++}/200/200`,
      ownerAddress: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      contractAddress: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      startDate,
      endDate,
      id: crypto.randomUUID(),
    };
  });
};
