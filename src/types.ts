import BigNumber from "bignumber.js";
import { Address } from "ton";

export enum Provider {
  TONKEEPER = "TONKEEPER",
  TONHUB = "TONHUB",
  EXTENSION = "EXTENSION",
  OPEN_MASK = "OPEN_MASK",
  MY_TON_WALLET = "MY_TON_WALLET",
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
  proposalResult: {};
  totalPower: string;
  sumCoins: { [key: number]: BigNumber };
}

export enum QueryKeys {
  STATE = "STATE",
  PROPOSAL_INFO = "PROPOSAL_INFO",
  CONTRACT_ADDRESS = "CONTRACT_ADDRESS",
  SERVER_HEALTH_CHECK = "SERVER_HEALTH_CHECK",
}

export interface StateData {
  results?: Results;
  votes?: Vote[];
}

export interface Vote {
  address: string;
  vote: number[];
  votingPower: string;
  timestamp: number;
  hash: string;
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

export type RawVote = { timestamp: number; vote: number[], hash: string };
export type RawVotes = { [key: string]: RawVote };



export interface ProposalInfo {
  startTime: Number;
  endTime: Number;
  snapshot: {
  snapshotTime: Number;
    mcSnapshotBlock: Number;
  };
}


export interface GetState {
  votes: Vote[];
  proposalResults: Results;
  votingPower: VotingPower;
}


export type GetTransactionsPayload = {
  allTxns: Transaction[];
  maxLt: string;
};


export type EndpointsArgs = {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
};
