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
  onSuccess: () => void;
  metadata: DaoMetadataForm;
  daoAddress: string;
}


export interface ReactQueryConfig {
  refetchInterval?: number;
  staleTime?: number;
  disabled?: boolean;
}

export interface GetProposalArgs extends ReactQueryConfig {
  validateUpdateTime?: boolean;
  isCustomEndpoint?: boolean;
  validateServerMaxLt?: boolean;
  ignoreMaxLt?: boolean;
  
}