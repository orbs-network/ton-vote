import _ from "lodash";
import { Dao, Proposal } from "types";
import { proposals } from "./proposals";
import { daos } from "./daos";
const ADDRESS = "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN-mock-";

const proposalAddresses = _.compact(
  _.map(proposals, (_, index) => `${ADDRESS}${index}`)
);

const getMockProposal = (address: string): Proposal | null => {
  const index = address.split(ADDRESS)[1];
  const result = proposals[parseInt(index)];
  return result ? result : null;
};

const isMockProposal = (address: string): boolean => {
  return proposalAddresses.includes(address);
};

const isMockDao = (address: string): Dao | null => {
  const result =  _.find(daos, (it) => it.daoAddress === address)
  return result ? result : null;
};

export const mock = {
  proposals,
  getMockProposal,
  proposalAddresses,
  isMockProposal,
  daos,
  isMockDao,
};
