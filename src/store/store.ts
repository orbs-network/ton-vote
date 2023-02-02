import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TonConnection } from "@ton-defi.org/ton-connection";
import { PAGE_SIZE } from "config";
import { ClientsState, EndpointState, MaxLtState, PersistedState, VotesState, WalletState } from "./types";

export const usePersistedStore = create(
  persist<PersistedState>(
    (set) => ({
      onUpdate: (clientV2Endpoint, clientV4Endpoint, apiKey) =>
        set({ clientV2Endpoint, clientV4Endpoint, apiKey }),
    }),
    {
      name: "ton_vote_custom_endpoints", // name of the item in the storage (must be unique)
    }
  )
);

export const useClientStore = create<ClientsState>((set, get) => ({
  setClients: (clientV2, clientV4) => set({ clientV2, clientV4 }),
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
}));



export const useMaxLtStore = create<MaxLtState>((set, get) => ({
  setMaxLt: (maxLt) => set({ maxLt }),
  maxLt: null,
}));


export const useVotesStore = create<VotesState>((set, get) => ({
  page: PAGE_SIZE,
  nextPage: () => set({ page: get().page + PAGE_SIZE }),
  hasNextPage: true,
}));
