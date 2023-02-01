export enum Provider {
  TONKEEPER = "TONKEEPER",
  TONHUB = "TONHUB",
  EXTENSION = "EXTENSION",
}

export interface WalletProvider {
  type: Provider;
  icon: string;
  title: string;
  description: string;
  mobileDisabled?: boolean;
  reminder?: boolean;
}

export interface Results {
  yes: number;
  no: number;
  abstain: number;
  totalWeight: string;
}

export enum QueryKeys {
  DATA = "DATA",
  TRANSACTIONS = "TRANSACTIONS",
  PROPOSAL_INFO = "PROPOSAL_INFO",
}

export interface Data {
  votingPower?: VotingPower;
  currentResults?: Results;
  votes?: Vote[];
}

export interface Vote {
  address: string;
  vote: string;
  votingPower: string;
}

export type VotingPower = { [key: string]: string };
