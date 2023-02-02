import { TonConnection, TonWalletProvider } from "@ton-defi.org/ton-connection";
import { TonClient, TonClient4 } from "ton";

export interface PersistedState {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
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

export interface MaxLtState {
  maxLt: string | null;
  setMaxLt: (value: string | null) => void;
}


export interface VotesState {
  page: number;
  nextPage: () => void;
  hasNextPage: boolean;
}
