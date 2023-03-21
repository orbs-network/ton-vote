import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EndpointModalStore, PersistedEndpointStore } from "./types";
export const useAppPersistedStore = create(
  persist<PersistedEndpointStore>(
    (set, get) => ({
      latestMaxLtAfterTx: {},
      setLatestMaxLtAfterTx: (contractAddress, value) => {
        const prev = { ...get().latestMaxLtAfterTx, [contractAddress]: value };
        set({
          latestMaxLtAfterTx: prev,
        });
      },
      serverUpdateTime: undefined,
      clientV2Fallback: undefined,
      clientV4Fallback: undefined,
      setSrverUpdateTime: (serverUpdateTime) => set({ serverUpdateTime }),
      setClientV2Fallback: (clientV2Fallback) => set({ clientV2Fallback }),
      setClientV4Fallback: (clientV4Fallback) => set({ clientV4Fallback }),
      setEndpoints: (args) => {
        set({
          clientV2Endpoint: args?.clientV2Endpoint,
          clientV4Endpoint: args?.clientV4Endpoint,
          apiKey: args?.apiKey,
        });
      },
    }),
    {
      name: "ton_vote_persisted_store", // name of the item in the storage (must be unique)
    }
  )
);

export const useEnpointModalStore = create<EndpointModalStore>((set, get) => ({
  showSetEndpoint: false,
  endpointError: false,
  setShowSetEndpoint: (showSetEndpoint) => set({ showSetEndpoint }),
  setEndpointError: (endpointError) => {
    set({ endpointError, showSetEndpoint: endpointError ? true : false });
  },
}));
