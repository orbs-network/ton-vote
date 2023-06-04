import { DaoMetadataForm } from "types";

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


export interface ReactQueryConfig {
  refetchInterval?: number;
  staleTime?: number;
  disabled?: boolean;
}


export interface UpdateProposalArgs {
  daoAddress: string;
  proposalAddr: string;
  title: string;
  description: string;
  onSuccess?: () => void;
}