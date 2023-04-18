import { APPROVE_TX } from "config";
import { Dao, EndpointsArgs } from "types";
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

interface DaoFromContractStore {
  dao?: Dao;
  setDao: (value?: Dao) => void;
}

export const useDaoFromContractStore = create<DaoFromContractStore>(
  (set, get) => ({
    dao: undefined,
    setDao: (dao) => set({ dao }),
  })
);


interface useTxReminderPopup {
  open: boolean;
  setOpen: (value: boolean) => void;
  setText: (value?: string) => void;
  text?: string;
}

export const useTxReminderPopup = create<useTxReminderPopup>((set, get) => ({
  open: false,
  text: APPROVE_TX,
  setOpen: (open) => set({ open }),
  setText: (text) => set({ text }),
}));




