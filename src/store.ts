import { releaseMode } from "config";
import _ from "lodash";
import moment from "moment";
import { ProposalResult } from "ton-vote-contracts-sdk";
import { ThemeType, Vote } from "types";
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
      name: `new_data_store`,
    }
  )
);

interface SyncStore {
  daoUpdateMillis: { [key: string]: number | undefined };
  getDaoUpdateMillis: (daoAddress: string) => number | undefined;
  setDaoUpdateMillis: (daoAddress: string) => void;
  removeDaoUpdateMillis: (daoAddress: string) => void;

  proposalUpdateMillis: { [key: string]: number | undefined };
  getProposalUpdateMillis: (proposalAddress: string) => number | undefined;
  setProposalUpdateMillis: (proposalAddress: string) => void;
  removeProposalUpdateMillis: (proposalAddress: string) => void;
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
      proposalUpdateMillis: {},
      getProposalUpdateMillis: (address) => {
        const proposalUpdateMillisMap = get().proposalUpdateMillis;
        return proposalUpdateMillisMap[address];
      },
      removeProposalUpdateMillis: (address) => {
        const proposalUpdateMillisMap = get().proposalUpdateMillis;
        const newValue = {
          ...proposalUpdateMillisMap,
          [address]: undefined,
        };
        set({ proposalUpdateMillis: _.omit(newValue) });
      },
      setProposalUpdateMillis: (address) => {
        const proposalUpdateMillisMap = get().proposalUpdateMillis;
        const newValue = {
          ...proposalUpdateMillisMap,
          [address]: moment().valueOf(),
        };
        set({ proposalUpdateMillis: newValue });
      },
    }),
    {
      name: "sync_store",
    }
  )
);

interface VotePersistedStore {
  maxLtAfterVote: { [key: string]: string | undefined };
  vote: { [key: string]: Vote | undefined };
  results: { [key: string]: ProposalResult | undefined };

  getValues: (proposalAddress: string) => {
    results: ProposalResult | undefined;
    vote: Vote | undefined;
    maxLtAfterVote: string | undefined;
  };

  setValues: (
    proposalAddress: string,
    maxLtAfterVote?: string,
    vote?: Vote,
    results?: ProposalResult
  ) => void;

  resetValues: (proposalAddress: string) => void;
}

export const useVotePersistedStore = create(
  persist<VotePersistedStore>(
    (set, get) => ({
      vote: {},
      results: {},
      maxLtAfterVote: {},
      resetValues: (proposalAddress) => {
        set({
          results: _.omitBy(
            { ...get().results, [proposalAddress]: undefined },
            _.isUndefined
          ),
          maxLtAfterVote: _.omitBy(
            { ...get().maxLtAfterVote, [proposalAddress]: undefined },
            _.isUndefined
          ),
          vote: _.omitBy(
            { ...get().vote, [proposalAddress]: undefined },
            _.isUndefined
          ),
        });
      },
      setValues: (proposalAddress, maxLtAfterVote, vote, results) => {
        set({
          results: _.omitBy(
            { ...get().results, [proposalAddress]: results },
            _.isUndefined
          ),
          maxLtAfterVote: _.omitBy(
            {
              ...get().maxLtAfterVote,
              [proposalAddress]: maxLtAfterVote,
            },
            _.isUndefined
          ),
          vote: _.omitBy(
            { ...get().vote, [proposalAddress]: vote },
            _.isUndefined
          ),
        });
      },
      getValues: (proposalAddress) => {
        return {
          results: get().results[proposalAddress],
          vote: get().vote[proposalAddress],
          maxLtAfterVote: get().maxLtAfterVote[proposalAddress],
        };
      },
    }),
    {
      name: "proposals_store", // name of the item in the storage (must be unique)
    }
  )
);

interface SettingsStore {
  themeMode?: ThemeType;
  setThemeMode: (theme: ThemeType) => void;
  toggleThemeMode: () => void;
  beta: boolean;
  setBeta: (beta: boolean) => void;
}

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set, get) => ({
      beta: false,
      setBeta: (beta) => set({ beta }),
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
      name: "app_settings",
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

interface ErrorStore {
  proposalError: boolean;
  setProposalError: (proposalError: boolean) => void;
}

export const useErrorStore = create<ErrorStore>((set, get) => ({
  proposalError: false,
  setProposalError: (proposalError) => set({ proposalError }),
}));

interface AirdropInit {
  voters: string[];
  jettonAddress: string;
  jettonsAmount: number;
  type: "jetton" | "nft";
  votersSelectionMethod: number;
}

interface AirdropStore {
  reset: () => void;
  setDaos: (daos: string[]) => void;
  setProposals: (proposals: string[]) => void;
  setStep: (step: number) => void;
  initAirdrop: (values: AirdropInit) => void;
  incrementCurrentWalletIndex: () => void;
  deleteProposal: (proposal: string) => void;
  setVoters: (voters: string[]) => void;
  nextStep: () => void;
  voters?: string[];
  currentWalletIndex?: number;
  jettonAddress?: string;
  jettonsAmount?: number;
  type?: "jetton" | "nft";
  daos?: string[];
  proposals?: string[];
  step?: number;
  votersSelectionMethod?: number;
}

const initialAirdropValues = {
  votersSelectionMethod: undefined,
  type: undefined,
  jettonsAmount: undefined,
  jettonAddress: "",
  voters: [],
  currentWalletIndex: 0,
  daos: [],
  proposals: [],
  step: 0,
};

export const useAirdropStore = create(
  persist<AirdropStore>(
    (set, get) => ({
      nextStep: () => {
        const step = get().step || 0;
        set({ step: step + 1 });
      },
      setVoters: (voters) => {
        set({ voters });
      },
      deleteProposal: (proposal) => {
        const proposals = get().proposals || [];
        set({ proposals: _.without(proposals, proposal) });
      },
      ...initialAirdropValues,
      initAirdrop: (values) => {
        set({ ...values });
      },
      incrementCurrentWalletIndex: () => {
        const index = get().currentWalletIndex || 0;
        set({ currentWalletIndex: index + 1 });
      },
      setStep: (step) => {
        set({ step });
      },
      setProposals: (proposals) => {
        set({ proposals });
      },
      setDaos: (daos) => {
        if (!_.size(daos) || !_.isEqual(daos, get().daos)) {
          set({ proposals: [] });
        }
        set({ daos });
      },
      reset: () => set(initialAirdropValues),
    }),
    {
      name: "airdrop",
    }
  )
);
