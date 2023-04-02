import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EndpointsArgs } from "./types";

interface EndpointModal {
  show: boolean;
  error: boolean;
  setShow: (value: boolean) => void;
  setError: (value: boolean) => void;
}

interface PersistedEndpointStore {
  serverUpdateTime?: number;
  setSrverUpdateTime: (value: number) => void;
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
  setEndpoints: (args?: EndpointsArgs) => void;
  latestMaxLtAfterTx: { [key: string]: string | undefined };
  getLatestMaxLtAfterTx: (proposalAddress: string) => string | undefined;
  setLatestMaxLtAfterTx: (contractAddress: string, value?: string) => void;
}

export const useAppPersistedStore = create(
  persist<PersistedEndpointStore>(
    (set, get) => ({
      latestMaxLtAfterTx: {},
      getLatestMaxLtAfterTx: (proposalAddress) =>
        get().latestMaxLtAfterTx
          ? get().latestMaxLtAfterTx[proposalAddress]
          : undefined,
      setLatestMaxLtAfterTx: (contractAddress, value) => {
        const prev = { ...get().latestMaxLtAfterTx, [contractAddress]: value };
        set({
          latestMaxLtAfterTx: prev,
        });
      },
      serverUpdateTime: undefined,
      setSrverUpdateTime: (serverUpdateTime) => set({ serverUpdateTime }),
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

export const useEnpointModal = create<EndpointModal>((set) => ({
  show: false,
  error: false,
  setShow: (show) => set({ show }),
  setError: (error) => {
    set({ error, show: error ? true : false });
  },
}));
