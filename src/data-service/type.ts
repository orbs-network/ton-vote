import { Dao, DaoProposal, ProposalInfo } from "types";

export interface DataService {
  getDAOS: () => Dao[];
  getDAO: (id: string) => Dao;
  getDAOProposals: (id: string) => DaoProposal[];
  getDAOProposalInfo: (address: string) => Promise<ProposalInfo>;
}