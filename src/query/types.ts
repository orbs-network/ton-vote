import { ProposalMetadata } from "ton-vote-contracts-sdk";
import { DaoMetadataForm, Proposal } from "types";

export interface CreateDaoArgs {
  metadataAddress: string;
  ownerAddress: string;
  proposalOwner: string;
  dev: boolean
}


export interface CreateMetadataArgs {
  onSuccess: (address: string) => void;
  metadata: DaoMetadataForm;
}


export interface UpdateMetadataArgs {
  metadata: DaoMetadataForm;
  daoAddress: string;
}

