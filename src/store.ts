import _ from "lodash";
import moment from "moment";
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
            proposals: {
              ...state.proposals,
              [dao]: _.uniq([proposal, ...proposals]),
            },
          };
        }),
      removeProposal: (dao, proposal) =>
        set((state) => {
          const proposals = state.proposals[dao] || [];
          return {
            proposals: {
              ...state.proposals,
              [dao]: proposals.filter((p) => p !== proposal),
            },
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
}

export const useTxReminderPopup = create<useTxReminderPopup>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

interface SyncStore {
  daoUpdateMillis: { [key: string]: number | undefined };
  getDaoUpdateMillis: (daoAddress: string) => number | undefined;
  setDaoUpdateMillis: (daoAddress: string) => void;
  removeDaoUpdateMillis: (daoAddress: string) => void;
}

export const useSyncStore = create(
  persist<SyncStore>(
    (set, get) => ({
      daoUpdateMillis: {},
      getDaoUpdateMillis: (daoAddress) => {
        const daoUpdateMillisMap = get().daoUpdateMillis;
        return daoUpdateMillisMap[daoAddress];
      },
      removeDaoUpdateMillis: (daoAddress) => {
        const daoUpdateMillisMap = get().daoUpdateMillis;
        const newValue = {
          ...daoUpdateMillisMap,
          [daoAddress]: undefined,
        };
        set({ daoUpdateMillis: _.omit(newValue) });
      },
      setDaoUpdateMillis: (daoAddress) => {
        const daoUpdateMillisMap = get().daoUpdateMillis;
        const newValue = {
          ...daoUpdateMillisMap,
          [daoAddress]: moment().valueOf(),
        };
        set({ daoUpdateMillis: newValue });
      },
    }),
    {
      name: "ton_vote_sync_store",
    }
  )
);
