import { TonConnection, TonWalletProvider } from "@ton-defi.org/ton-connection";
import { TonClient, TonClient4 } from "ton";
import { Results, Transaction, Vote, VotingPower } from "types";

export interface PersistedState {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
  serverDisabled: boolean;
  disableServer: () => void;
  isCustomEndpoints: boolean;
  enableServer: () => void;
  currentDataMaxLt?: string;
  setMaxLt: (value: string) => void;
  clearMaxLt: () => void;
  onUpdate: (
    clientV2Endpoint?: string,
    clientV4Endpoint?: string,
    apiKey?: string
  ) => void;
}
export interface ClientsState {
  clientV2?: TonClient;
  clientV4?: TonClient4;
  setClients: (clientV2: TonClient, clientV4: TonClient4) => void;
}

export interface DataUpdaterStore {
  reset: () => void;
  timestamp?: number;
  setTimestamp: (value: number) => void;
  stateUpdateTime: number;
  setStateUpdateTime: (value: number) => void;
}

export interface EndpointState {
  setShowSetEndpoint: (value: boolean) => void;
  showSetEndpoint: boolean;
  endpointError: boolean;
  setEndpointError: (value: boolean) => void;
}

export interface WalletState {
  address?: string;
  setAddress: (value: string) => void;
  setTonConnectionProvider: (provider: TonWalletProvider) => void;
  connection?: TonConnection;
  reset: () => void;
}

export interface VotesPaginationState {
  limit: number;
  loadMore: (value?: number) => void;
  reset: () => void;
}

export interface VoteState {
  vote: string;
  setVote: (value?: string) => void;
  reset: () => void;
}

export interface DataState {
  transactions: Transaction[];
  votes: Vote[];
  proposalResults?: Results;
  votingPower?: VotingPower;
  maxLt?: string;
  setMaxLt: (value: string) => void;
  setData: (
    votes: Vote[],
    proposalResults: Results,
    votingPower: VotingPower
  ) => void;
  setVotes: (votes: Vote[]) => void;
  clearTransactions: () => void;
  addTransactions: (value: Transaction[]) => void;
  reset: () => void;
}
