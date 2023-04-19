import { APPROVE_TX } from "config";
import _ from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NewDataStore {
  daos: string[];
  addDao: (value: string) => void;
  removeDao: (value: string) => void;
  proposals: { [key: string]: string[] };
  addProposal: (dao: string, proposal: string) => void;
  removeProposal: (dao: string, proposal: string) => void;
}

export const useNewDataStore = create(
  persist<NewDataStore>(
    (set) => ({
      daos: [],
      proposals: {},
      addDao: (dao) => set((state) => ({ daos: _.uniq([...state.daos, dao]) })),
      removeDao: (dao) =>
        set((state) => ({ daos: state.daos.filter((d) => d !== dao) })),
      addProposal: (dao, proposal) =>
        set((state) => {
          const proposals = state.proposals[dao] || [];
          return {
            proposals: { ...state.proposals, [dao]: _.uniq([proposal, ...proposals]) },
          };
        }),
      removeProposal: (dao, proposal) =>
        set((state) => {
          const proposals = state.proposals[dao] || [];
          return {
            proposals: { ...state.proposals, [dao]: proposals.filter((p) => p !== proposal) },
          };
        }),
    }),
    {
      name: "ton_vote_new_data_store",
    }
  )
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
