import _ from "lodash";
import moment from "moment";
import { ThemeType } from "types";
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

interface ProposalPersistedStore {
  serverUpdateTime?: number;
  setSrverUpdateTime: (value: number) => void;
  latestMaxLtAfterTx: { [key: string]: string | undefined };
  getLatestMaxLtAfterTx: (proposalAddress: string) => string | undefined;
  setLatestMaxLtAfterTx: (contractAddress: string, value?: string) => void;
}

export const useProposalPersistedStore = create(
  persist<ProposalPersistedStore>(
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
    }),
    {
      name: "ton_vote_proposal_persisted_store", // name of the item in the storage (must be unique)
    }
  )
);

interface SettingsStore {
  themeMode?: ThemeType;
  setThemeMode: (theme: ThemeType) => void;
  toggleThemeMode: () => void;
}

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set, get) => ({
      themeMode: undefined,
      setThemeMode: (themeMode) => set({ themeMode }),
      toggleThemeMode: () => {
        const themeMode = get().themeMode;
        if (themeMode === "dark") {
          set({ themeMode: "light" });
        } else {
          set({ themeMode: "dark" });
        }
      },
    }),
    {
      name: "ton_vote_settings",
    }
  )
);

interface VoteStore {
  isVoting: boolean;
  setIsVoting: (isVoting: boolean) => void;
}

export const useVoteStore = create<VoteStore>((set, get) => ({
  isVoting: false,
  setIsVoting: (isVoting) => set({ isVoting }),
}));
