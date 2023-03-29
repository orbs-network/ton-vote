import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TonConnection } from "@ton-defi.org/ton-connection";
import { manifestUrl, PAGE_SIZE, DEFAULT_ENDPOINTS } from "config";
import TonConnect from "@tonconnect/sdk";

import {
  ClientsStore,
  ConnectionStore,
  ContractStore,
  EndpointStore,
  PersistedStore,
  ServerStore,
  TxStore,
  VotesPaginationStore,
  VoteStore,
} from "./types";
export const usePersistedStore = create(
  persist<PersistedStore>(
    (set) => ({
      defaultClientV2Endpoint: "",
      defaultClientV4Endpoint: "",
      apiKey: "",
      defa: "",
      maxLt: undefined,
      setMaxLt: (maxLt) => set({ maxLt }),
      clearMaxLt: () => set({ maxLt: undefined }),
      serverDisabled: import.meta.env.VITE_SERVER_DISABLED,
      disableServer: (serverDisabled) => set({ serverDisabled }),
      isCustomEndpoints: false,
      setDefaultV2ClientEndpoint: (defaultClientV2Endpoint) =>
        set({ defaultClientV2Endpoint }),
      setDefaultV4ClientEndpoint: (defaultClientV4Endpoint) =>
        set({ defaultClientV4Endpoint }),
      onUpdate: (clientV2Endpoint, clientV4Endpoint, apiKey) => {
        set({
          clientV2Endpoint,
          clientV4Endpoint,
          apiKey,
          isCustomEndpoints: !!clientV2Endpoint,
        });
      },
    }),
    {
      name: "ton_vote_persisted_store_1", // name of the item in the storage (must be unique)
    }
  )
);

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  address: undefined,
  connection: undefined,
  connectorTC: new TonConnect({
    manifestUrl,
  }),
  reset: () => set({ address: undefined, connection: undefined }),
  setAddress: (address) => set({ address }),
  setTonConnectionProvider: (provider) => {
    const _connection = new TonConnection();
    _connection.setProvider(provider);
    set({ connection: _connection });
  },
}));

export const useServerStore = create<ServerStore>((set, get) => ({
  serverUpdateTime: undefined,
  serverMaxLt: undefined,
  reset: () => set({ serverUpdateTime: undefined, serverMaxLt: undefined }),
  setServerUpdateTime: (serverUpdateTime) => set({ serverUpdateTime }),
  setServerMaxLt: (serverMaxLt) => set({ serverMaxLt }),
}));

export const useContractStore = create<ContractStore>((set, get) => ({
  contractMaxLt: undefined,
  transactions: [],
  reset: () => set({ contractMaxLt: undefined, transactions: [] }),

  setContractMaxLt: (contractMaxLt) => set({ contractMaxLt }),
  addContractTransactions: (newTransactions) => {
    const transactions = get().transactions;
    transactions.unshift(...newTransactions);
    set({ transactions });
    return transactions;
  },
  clearContractTransactions: () => set({ transactions: [] }),
}));

export const useClientStore = create<ClientsStore>((set, get) => ({
  clientV2: undefined,
  clientV4: undefined,
  setClients: (clientV2, clientV4) => set({ clientV2, clientV4 }),
}));

export const useVotesPaginationStore = create<VotesPaginationStore>(
  (set, get) => ({
    votesViewLimit: PAGE_SIZE,
    reset: () => set({ votesViewLimit: PAGE_SIZE }),
    showMoreVotes: (amount = PAGE_SIZE) =>
      set({ votesViewLimit: get().votesViewLimit + amount }),
  })
);

export const useEndpointStore = create<EndpointStore>((set, get) => ({
  showSetEndpoint: false,
  endpointError: false,

  setShowSetEndpoint: (showSetEndpoint) => set({ showSetEndpoint }),
  setEndpointError: (endpointError) => {
    set({ endpointError, showSetEndpoint: endpointError ? true : false });
  },
}));

export const useTxStore = create<TxStore>((set, get) => ({
  txLoading: false,

  setTxLoading: (txLoading) => set({ txLoading }),
}));
