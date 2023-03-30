import _ from "lodash";
import moment from "moment";
import { Address } from "ton";
import {
  DaoMetadata,
  DaoProposal,
  ProposalMetadata,
  GetDaoProposals,
  GetDaos,
} from "types";


const proposalAddresses = [
  "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS",
  "EQCYUeHtuIshs3xS2d_uI9WNV5gmtGw57TKcyk_oBZiD7eyb",
  "EQCmnBaZmlgbURj0GcJCH4foWEuk0O5lWNQDI6B_6wyto-B2",
  "EQCogh0uaL1-p7nBx4eB8yIrH2Pf5qQ5ZUUeS4on5VzAkQHH",
  "EQAkjdUMkoGxy1LmD7nMj1b_FNImolA1dfqGiLkV56VPbCl5",
  "EQC1dF4jDhLTBYkSoQOCLP0Hn2sXW12K9poC9ObO0XENCpBn",
];



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

export const getProposals = (): GetDaoProposals => {
  return {
    endProposalId: BigInt(0),
    proposalAddresses: _.range(0, 5).map((e, i) => {
      const address = proposalAddresses[i]

      return Address.parse(address!);
    }),
  };
};

export const getProposalMetadata = (
  proposalAddress: string
): ProposalMetadata => {
  return {
    title: "Some title",
    description: "Some description",
    owner: proposalAddress,
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
