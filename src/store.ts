import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EndpointsArgs } from "./types";

interface EndpointModalStore {
  showSetEndpoint: boolean;
  endpointError: boolean;
  setShowSetEndpoint: (value: boolean) => void;
  setEndpointError: (value: boolean) => void;
}

interface PersistedEndpointStore {
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
  getLatestMaxLtAfterTx: (proposalAddress: string) => string | undefined ;
  setLatestMaxLtAfterTx: (contractAddress: string, value?: string) => void;
}

export const useAppPersistedStore = create(
  persist<PersistedEndpointStore>(
    (set, get) => ({
      latestMaxLtAfterTx: {},
      getLatestMaxLtAfterTx: (proposalAddress) =>
        get().latestMaxLtAfterTx ? get().latestMaxLtAfterTx[proposalAddress] : undefined,
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

export const useLatestMaxLtAfterTx = (address: string) => {
  const latestMaxLtAfterTx = useAppPersistedStore(
    (store) => store.latestMaxLtAfterTx || {}
  );
  
  return latestMaxLtAfterTx[address];
};


export const useEnpointModal = create<EndpointModalStore>((set, get) => ({
  showSetEndpoint: false,
  endpointError: false,
  setShowSetEndpoint: (showSetEndpoint) => set({ showSetEndpoint }),
  setEndpointError: (endpointError) => {
    set({ endpointError, showSetEndpoint: endpointError ? true : false });
  },
}));
