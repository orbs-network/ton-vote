import moment from "moment";
import { Address } from "ton";
import { TonConnection, TonWalletProvider } from "@ton-defi.org/ton-connection";
import { TonClient, TonClient4 } from "ton";
import TonConnect from "@tonconnect/sdk";

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
  yes: number;
  no: number;
  abstain: number;
  totalWeight: string;
}

export enum QueryKeys {
  STATE = "STATE",
  PROPOSAL_INFO = "PROPOSAL_INFO",
  PROPOSAL_TIMELINE = "PROPOSAL_TIMELINE",
}

export interface StateData {
  results?: Results;
  votes?: Vote[];
}

export interface Vote {
  address: string;
  vote: string;
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

export type RawVote = { timestamp: number; vote: string; hash: string };
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

export interface Space {
  name: string;
  members: number;
  image: string;
  id: string;
}

export interface Proposal {
  startDate: number;
  endDate: number;
  title: string;
  description: string;
  ownerAvatar: string;
  ownerAddress: string;
  contractAddress: string;
  id: string;
}

export type ProposalStatus = "finished" | "in-progress" | undefined;

export interface PersistedEndpointStore {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
  setEndpoint: (args?: EndpointsArgs) => void;
}

export interface EndpointModalStore {
  showSetEndpoint: boolean;
  endpointError: boolean;
  setShowSetEndpoint: (value: boolean) => void;
  setEndpointError: (value: boolean) => void;
}

export interface ConnectionStore {
  connectorTC: TonConnect;
  reset: () => void;
  address?: string;
  connection?: TonConnection;
  setAddress: (value?: string) => void;
  setTonConnectionProvider: (provider: TonWalletProvider) => void;
  clientV2?: TonClient;
  clientV4?: TonClient4;
  setClients: (clientV2: TonClient, clientV4: TonClient4) => void;
}
