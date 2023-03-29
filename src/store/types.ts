import { TonConnection, TonWalletProvider } from "@ton-defi.org/ton-connection";
import { PAGE_SIZE } from "config";
import { TonClient, TonClient4 } from "ton";
import { Transaction } from "types";
import { create } from "zustand";
import TonConnect from "@tonconnect/sdk";

export interface PersistedStore {
  setDefaultV2ClientEndpoint: (value: string) => void;
  setDefaultV4ClientEndpoint: (value: string) => void;
  defaultClientV2Endpoint?: string;
  defaultClientV4Endpoint?: string;
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
  serverDisabled: boolean;
  isCustomEndpoints: boolean;
  maxLt?: string;
  disableServer: (value: boolean) => void;
  setMaxLt: (value: string) => void;
  clearMaxLt: () => void;
  onUpdate: (
    clientV2Endpoint?: string,
    clientV4Endpoint?: string,
    apiKey?: string
  ) => void;
}



export interface EndpointStore {
  showSetEndpoint: boolean;
  endpointError: boolean;
  setShowSetEndpoint: (value: boolean) => void;
  setEndpointError: (value: boolean) => void;
}

export interface VotesPaginationStore {
  showMoreVotes: (value?: number) => void;
  votesViewLimit: number;
  reset: () => void;
}

export interface VoteStore {
  selectedOptions: number[];
  setSelectedOptions: (value?: number[]) => void;
  selectOption: (value: number) => void;
}

export interface ClientsStore {
  clientV2?: TonClient;
  clientV4?: TonClient4;
  setClients: (clientV2: TonClient, clientV4: TonClient4) => void;
}

export interface ContractStore {
  reset: () => void;
  contractMaxLt?: string;
  transactions: Transaction[];
  clearContractTransactions: () => void;
  setContractMaxLt: (value?: string) => void;
  addContractTransactions: (value: Transaction[]) => Transaction[];
}

export interface ServerStore {
  reset: () => void;
  setServerUpdateTime: (value?: number) => void;
  setServerMaxLt: (value?: string) => void;
  serverUpdateTime?: number;
  serverMaxLt?: string;
}

export interface ConnectionStore {
  connectorTC: TonConnect;
  reset: () => void;
  address?: string;
  connection?: TonConnection;
  setAddress: (value?: string) => void;
  setTonConnectionProvider: (provider: TonWalletProvider) => void;
}

export interface TxStore {
  txLoading: boolean;
  setTxLoading: (txLoading: boolean) => void;
}

