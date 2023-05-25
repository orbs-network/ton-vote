import { Endpoints } from "types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EndpointsStore {
  endpoints?: Endpoints;
  setEndpoints: (endpoints?: Endpoints) => void;
}

export const useEnpointsStore = create(
  persist<EndpointsStore>(
    (set) => ({
      endpoints: undefined,
      setEndpoints: (endpoints) => {
        set({ endpoints });
      },
    }),
    {
      name: "ton_vote_endpoints_verify_store",
    }
  )
);
