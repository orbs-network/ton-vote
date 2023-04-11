import { EndpointsArgs } from "types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EndpointsStore {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
  setEndpoints: (args?: EndpointsArgs) => void;
}

export const useEnpointsStore = create(
  persist<EndpointsStore>(
    (set) => ({
      serverUpdateTime: undefined,
      setEndpoints: (args) => {
        set({
          clientV2Endpoint: args?.clientV2Endpoint,
          clientV4Endpoint: args?.clientV4Endpoint,
          apiKey: args?.apiKey,
        });
      },
    }),
    {
      name: "ton_vote_endpoints_store",
    }
  )
);
