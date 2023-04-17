import { Address, Transaction } from "ton";
import { DaoRoles, Votes } from "ton-vote-sdk";


export interface ProposalMetadata {
  id: number;
  owner: string;
  mcSnapshotBlock: number;
  proposalStartTime: number;
  proposalEndTime: number;
  proposalSnapshotTime: number;
  proposalType: number;
  votingPowerStrategy: number;
  title?: string;
  description?: string
}

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
  daoAddress: string;
  daoId?: number;
  daoMetadata: DaoMetadata;
  daoRoles: DaoRoles;
  daoProposals: string[];
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

export enum ProposalStatus {
  CLOSED = "CLOSED",
  NOT_STARTED = "NOT_STARTED",
  ACTIVE = "ACTIVE",
}

export interface SelectOption {
  text: string;
  value: string;
}




export interface Proposal {
  votingPower?: VotingPower;
  votes: Vote[];
  proposalResult: ProposalResults;
  maxLt?: string;
  transactions?: Transaction[];
  metadata?: ProposalMetadata;
  daoAddress?: string;
  hardcoded?: boolean;
  url?: string
}

export type InputType =
  | "text"
  | "url"
  | "textarea"
  | "date"
  | "upload"
  | "editor"
  | "checkbox"
  | "address"
  | "image"

export interface InputInterface {
  label: string;
  type: InputType;
  name: string;
  defaultValue?: string;
  rows?: number;
  min?: number;
  max?: number;
  tooltip?: string;
}
