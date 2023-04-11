import { Address, Transaction } from "ton";
import { ProposalMetadata } from "ton-vote-sdk";

export interface ProposalResults {
  yes: number;
  no: number;
  abstain: number;
  totalWeight: string;
}

export interface Vote {
  address: string;
  vote: string;
  votingPower: string;
  timestamp: number;
  hash: string;
}

export type VotingPower = { [key: string]: string };

export type RawVote = { timestamp: number; vote: string; hash: string };
export type RawVotes = { [key: string]: RawVote };

export interface ProposalInfo {
  id: string;
  owner: string;
  mcSnapshotBlock: number;
  proposalStartTime: number;
  proposalEndTime: number;
  proposalSnapshotTime: number;
  proposalType: string;
  votingPowerStrategy: string;
}
export type EndpointsArgs = {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
};

export interface DaoMetadata {
  about: string;
  avatar: string;
  github: string;
  hide: boolean;
  name: string;
  terms: string;
  twitter: string;
  website: string;
}

export interface Dao {
  address: string;
  daoId?: number;
  daoMetadata: DaoMetadata;
  roles: DaoRoles;
}


export interface DaoRoles {
  owner: string;
  proposalOwner: string;
}

export interface Proposal {
  proposalAddr: string;
  metadata: ProposalMetadata;
}

export interface DaoProposal {
  startDate: number;
  endDate: number;
  title: string;
  description: string;
  ownerAvatar: string;
  ownerAddress: string;
  contractAddress: string;
  id: string;
}

export interface GetDaoProposals {
  endProposalId: number;
  proposalAddresses: string[] | undefined;
}



export enum ProposalStatus {
  CLOSED = "CLOSED",
  NOT_STARTED = "NOT_STARTED",
  ACTIVE = "ACTIVE",
}

export interface SelectOption {
  text: string;
  value: string;
}

export interface ProposalState {
  votingPower: VotingPower;
  votes: Vote[];
  results: ProposalResults;
  maxLt?: string;
  transactions?: Transaction[];
}

export type InputType =
  | "text"
  | "url"
  | "textarea"
  | "date"
  | "upload"
  | "editor";

export interface InputInterface {
  label: string;
  type: InputType;
  name: string;
  defaultValue?: string;
  rows?: number;
  min?: number;
  max?: number;
}
