import { ProposalMetadata } from "ton-vote-contracts-sdk";
import { DaoMetadataForm, Proposal } from "types";

export interface CreateDaoArgs {
  metadataAddress: string;
  ownerAddress: string;
  proposalOwner: string;
  onSuccess: (address: string) => void;
}


export interface CreateMetadataArgs {
  onSuccess: (address: string) => void;
  metadata: DaoMetadataForm;
}


export interface UpdateMetadataArgs {
  metadata: DaoMetadataForm;
  daoAddress: string;
}

export interface UpdateProposalArgs {
  daoAddress: string;
  metadata: ProposalMetadata;
  onSuccess?: () => void;
}