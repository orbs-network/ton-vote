import { Address } from "ton";

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
  GET_TRANSACTIONS = "GET_TRANSACTIONS",
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
  timestamp: number;
}

export interface Transaction {
  id: {
    lt: string;
    hash: string;
  };
  time: number;
  data: string;
  storageFee: string;
  otherFee: string;
  fee: string;
  inMessage: {
    source: string;
    destination: Address;
    forwardFee: string;
    ihrFee: string;
    value: string;
    createdLt: string;
    body: {
      type: string;
      text: string;
    };
  };
  outMessages: [];
}

export type VotingPower = { [key: string]: string };

export type GetTransactionsPayload = {
  allTxns: Transaction[];
  maxLt: string;
};
