import _ from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AirdropStoreKeys, VoterSelectionMethod } from "./types";

export interface AirdropStoreValues {
  [AirdropStoreKeys.votersAmount]?: number;
  [AirdropStoreKeys.voters]?: string[];
  [AirdropStoreKeys.currentWalletIndex]?: number;
  [AirdropStoreKeys.jettonAddress]?: string;
  [AirdropStoreKeys.jettonsAmount]?: number;
  [AirdropStoreKeys.assetType]?: "jetton" | "nft";
  [AirdropStoreKeys.daos]?: string[];
  [AirdropStoreKeys.proposals]?: string[];
  [AirdropStoreKeys.step]?: number;
  [AirdropStoreKeys.selectionMethod]?: VoterSelectionMethod;
  [AirdropStoreKeys.manuallySelectedVoters]?: string[];
  [AirdropStoreKeys.NFTItemsRecipients]?: { [key: string]: string };
}

export interface AirdropStore extends AirdropStoreValues {
  reset: () => void;
  setStep: (step: number) => void;
  incrementCurrentWalletIndex: () => void;
  nextStep: () => void;
  setValues: (values: AirdropStoreValues) => void;
  setNFTItemsRecipients: (voter: string, nftItem: string) => void;
}

export const initialState = {
  [AirdropStoreKeys.votersAmount]: undefined,
  [AirdropStoreKeys.voters]: undefined,
  [AirdropStoreKeys.currentWalletIndex]: undefined,
  [AirdropStoreKeys.jettonAddress]: undefined,
  [AirdropStoreKeys.nftCollection]: undefined,
  [AirdropStoreKeys.jettonsAmount]: undefined,
  [AirdropStoreKeys.assetType]: undefined,
  [AirdropStoreKeys.daos]: undefined,
  [AirdropStoreKeys.proposals]: undefined,
  [AirdropStoreKeys.step]: undefined,
  [AirdropStoreKeys.selectionMethod]: undefined,
  [AirdropStoreKeys.manuallySelectedVoters]: undefined,
  [AirdropStoreKeys.NFTItemsRecipients]: undefined,
};

export const useAirdropPersistStore = create(
  persist<AirdropStore>(
    (set, get) => ({
      ...initialState,
      setNFTItemsRecipients: (voter, nftItem) => {
        const NFTItemsRecipients = get().NFTItemsRecipients || {};
        set({
          NFTItemsRecipients: {
            ...NFTItemsRecipients,
            [voter]: nftItem,
          },
        });
      },
      setValues: (values) => {
        set(values);
      },
      nextStep: () => {
        const step = get().step || 0;
        set({ step: step + 1 });
      },
      incrementCurrentWalletIndex: () => {
        const index = get().currentWalletIndex || 0;
        set({ currentWalletIndex: index + 1 });
      },
      setStep: (step) => {
        set({ step });
      },

      reset: () => set(initialState),
    }),
    {
      name: "airdrop",
    }
  )
);

interface VotersSelectStore {
  [AirdropStoreKeys.votersAmount]?: number;
  [AirdropStoreKeys.daos]?: string[];
  [AirdropStoreKeys.proposals]?: string[];
  [AirdropStoreKeys.selectionMethod]?: VoterSelectionMethod;
  [AirdropStoreKeys.manuallySelectedVoters]?: string[];
  setProposals: (proposals: string[]) => void;
  selectProposal: (proposal: string) => void;
  setDao: (dao: string) => void;
  setManuallySelectedVoters: (voters: string) => void;
  reset: () => void;
}

export const useVotersSelectStore = create<VotersSelectStore>((set, get) => ({
  [AirdropStoreKeys.votersAmount]:
    useAirdropPersistStore.getState().votersAmount,
  [AirdropStoreKeys.daos]: useAirdropPersistStore.getState().daos,
  [AirdropStoreKeys.proposals]: useAirdropPersistStore.getState().proposals,
  [AirdropStoreKeys.selectionMethod]:
    useAirdropPersistStore.getState().selectionMethod,
  [AirdropStoreKeys.manuallySelectedVoters]:
    useAirdropPersistStore.getState().manuallySelectedVoters,
  setProposals: (proposals) => {
    set({ proposals });
  },
  selectProposal: (proposal) => {
    const proposals = get().proposals || [];
    set({
      manuallySelectedVoters: [],
      votersAmount: undefined,
      proposals: proposals.includes(proposal)
        ? _.without(proposals, proposal)
        : [...proposals, proposal],
    });
  },
  setManuallySelectedVoters: (voter) => {
    const manuallySelectedVoters = get().manuallySelectedVoters || [];
    set({
      manuallySelectedVoters: manuallySelectedVoters?.includes(voter)
        ? _.without(manuallySelectedVoters, voter)
        : [...manuallySelectedVoters, voter],
    });
  },
  setDao: (dao) => {
    const daos = get().daos || [];
    set({
      daos: daos.includes(dao) ? _.without(daos, dao) : [dao],
      proposals: [],
      manuallySelectedVoters: [],
      votersAmount: '' as any  as number,
      selectionMethod: VoterSelectionMethod.RANDOM,
    });
  },
  reset: () => {    
    set({
      [AirdropStoreKeys.votersAmount]:
        useAirdropPersistStore.getState().votersAmount,
      [AirdropStoreKeys.daos]: useAirdropPersistStore.getState().daos,
      [AirdropStoreKeys.proposals]: useAirdropPersistStore.getState().proposals,
      [AirdropStoreKeys.selectionMethod]:
        useAirdropPersistStore.getState().selectionMethod,
      [AirdropStoreKeys.manuallySelectedVoters]:
        useAirdropPersistStore.getState().manuallySelectedVoters,
    });
  },
}));


export interface AssetSelectValues {
  [AirdropStoreKeys.jettonAddress]?: string;
  [AirdropStoreKeys.jettonsAmount]?: number;
  [AirdropStoreKeys.assetType]?: "jetton" | "nft";
}

interface AssetSelectStore extends AssetSelectValues {
  reset: () => void;
}

export const useAssetSelectStore = create<AssetSelectStore>((set, get) => ({
  [AirdropStoreKeys.jettonAddress]:
    useAirdropPersistStore.getState().jettonAddress,
  [AirdropStoreKeys.jettonsAmount]:
    useAirdropPersistStore.getState().jettonsAmount,
  [AirdropStoreKeys.assetType]: useAirdropPersistStore.getState().assetType,
  reset: () => {
    set({
      [AirdropStoreKeys.jettonAddress]:
        useAirdropPersistStore.getState().jettonAddress,
      [AirdropStoreKeys.jettonsAmount]:
        useAirdropPersistStore.getState().jettonsAmount,
      [AirdropStoreKeys.assetType]: useAirdropPersistStore.getState().assetType,
    });
  },
}));
