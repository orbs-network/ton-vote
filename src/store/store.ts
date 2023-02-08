import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TonConnection } from "@ton-defi.org/ton-connection";
import { PAGE_SIZE } from "config";
import {
  ClientsState,
  DataUpdaterStore,
  EndpointState,
  PersistedState,
  TransactionsState,
  VotesPaginationState,
  VoteState,
  WalletState,
} from "./types";
export const usePersistedStore = create(
  persist<PersistedState>(
    (set) => ({
      maxLt: undefined,
      setMaxLt: (maxLt) => set({ maxLt }),
      clearMaxLt: () => set({ maxLt: undefined }),
      serverDisabled: false,
      disableServer: (serverDisabled) => set({ serverDisabled }),
      isCustomEndpoints: false,
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
      name: "ton_vote_persisted_store", // name of the item in the storage (must be unique)
    }
  )
);

export const useClientStore = create<ClientsState>((set, get) => ({
  setClients: (clientV2, clientV4) => set({ clientV2, clientV4 }),
}));

export const useServerStore = create<DataUpdaterStore>((set, get) => ({
  reset: () => set({ timestamp: 0, stateUpdateTime: 0, maxLt: undefined }),
  setTimestamp: (timestamp) => set({ timestamp }),
  stateUpdateTime: 0,
  setStateUpdateTime: (stateUpdateTime) => set({ stateUpdateTime }),
  setMaxLt: (maxLt) => set({ maxLt }),
}));

export const useEndpointsStore = create<EndpointState>((set, get) => ({
  showSetEndpoint: false,
  endpointError: false,
  setShowSetEndpoint: (showSetEndpoint) => set({ showSetEndpoint }),
  setEndpointError: (endpointError) => {
    set({ endpointError, showSetEndpoint: endpointError ? true : false });
  },
}));

const defultAcccountState = {
  address: undefined,
  connection: undefined,
};

export const useWalletStore = create<WalletState>((set, get) => ({
  reset: () => set(defultAcccountState),
  ...defultAcccountState,
  setAddress: (address) => set({ address }),
  setTonConnectionProvider: (provider) => {
    const _connection = new TonConnection();
    _connection.setProvider(provider);
    set({ connection: _connection });
  },
  txLoading: false,
  setTxLoading: (txLoading) => set({ txLoading }),
}));

export const useVotesPaginationStore = create<VotesPaginationState>(
  (set, get) => ({
    limit: PAGE_SIZE,
    loadMore: (amount = PAGE_SIZE) => set({ limit: get().limit + amount }),
    reset: () => set({ limit: PAGE_SIZE }),
  })
);

export const useVoteStore = create<VoteState>((set, get) => ({
  vote: "",
  setVote: (vote) => set({ vote }),
  reset: () => set({ vote: "" }),
}));

export const useContractStore = create<TransactionsState>((set, get) => ({
  page: undefined,
  transactions: [],
  setPage: (page) => set({ page }),
  addTransactions: (newTransactions) => {
    const transactions = get().transactions;
    transactions.unshift(...newTransactions);
    set({ transactions });
    return transactions;
  },
  reset: () => set({ page: undefined, transactions: [] }),
}));
