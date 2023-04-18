import { APPROVE_TX } from "config";
import { Dao, EndpointsArgs } from "types";
import { create } from "zustand";
import { persist } from "zustand/middleware";



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




