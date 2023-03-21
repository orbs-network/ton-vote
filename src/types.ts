import moment from "moment";
import { Address, TonTransaction } from "ton";
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

export interface ProposalState {
  votes: Vote[];
  proposalResults: Results;
  votingPower: VotingPower;
  maxLt?: string; 
}

export type EndpointsArgs = {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
};

export interface Dao {
  name: string;
  members: number;
  image: string;
  id: string;
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

export type ProposalStatus = "finished" | "in-progress" | undefined;

export interface PersistedEndpointStore {
  serverUpdateTime?: number;
  setSrverUpdateTime: (value: number) => void;
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
  setEndpoints: (args?: EndpointsArgs) => void;
  clientV2Fallback?: string;
  clientV4Fallback?: string;
  setClientV2Fallback: (clientV2Fallback: string) => void;
  setClientV4Fallback: (clientV4Fallback: string) => void;
  latestMaxLtAfterTx: { [key: string]: string | undefined };
  setLatestMaxLtAfterTx: (contractAddress: string, value?: string) => void;
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
}
