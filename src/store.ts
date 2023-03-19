import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EndpointModalStore, PersistedEndpointStore } from "./types";
export const useAppPersistedStore = create(
  persist<PersistedEndpointStore>(
    (set) => ({
      setEndpoint: (args) => {
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


export const useIsCustomEndpoint = () => {
  const {clientV2Endpoint, clientV4Endpoint} = useAppPersistedStore();

  return !!clientV2Endpoint && !!clientV4Endpoint;
}

export const useEnpointModalStore = create<EndpointModalStore>((set, get) => ({
  showSetEndpoint: false,
  endpointError: false,
  setShowSetEndpoint: (showSetEndpoint) => set({ showSetEndpoint }),
  setEndpointError: (endpointError) => {
    set({ endpointError, showSetEndpoint: endpointError ? true : false });
  },
}));
