import { APPROVE_TX } from "config";
import { Dao, EndpointsArgs } from "types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DaoStore {
  daos: string[];
  addDao: (value: string) => void;
  removeDao: (value: string) => void;
}

export const useDaoFromLocalStorage = create(
  persist<DaoStore>(
    (set) => ({
      daos: [],
      addDao: (dao) => set((state) => ({ daos: [...state.daos, dao] })),
      removeDao: (dao) =>
        set((state) => ({ daos: state.daos.filter((d) => d !== dao) })),
    }),
    {
      name: "ton_vote_dao_from_contract_store",
    }
  )
);

interface ProposalStore {
  proposals: { [key: string]: string };
  addProposal: (dao: string, proposal: string) => void;
  removeProposal: (dao:string, proposal: string) => void;
}

export const useProposlFromLocalStorage = create(
  persist<ProposalStore>(
    (set) => ({
      proposals: {},
      addProposal: (dao, proposal) =>
        set((state) => ({
          proposals: { ...state.proposals, [dao]: proposal }
        })),
      removeProposal: (dao) =>
        set((state) => ({
          proposals: { ...state.proposals, [dao]: '' },
        })),
    }),
    {
      name: "ton_vote_proposal_from_contract_store",
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
