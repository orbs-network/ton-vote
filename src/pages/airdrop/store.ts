import _ from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AirdropStoreKeys, VoterSelectionMethod } from "./types";

export interface AirdropForm {
  [AirdropStoreKeys.votersAmount]?: number;
  [AirdropStoreKeys.jettonsAmount]?: number;
  [AirdropStoreKeys.jettonAddress]?: string;
  [AirdropStoreKeys.assetType]?: "nft" | "jetton";
  [AirdropStoreKeys.selectionMethod]?: number;
  [AirdropStoreKeys.manuallySelectedVoters]?: string[];
  [AirdropStoreKeys.nftCollection]?: string;
}

export interface AirdropStoreValues {
  [AirdropStoreKeys.votersAmount]?: number;
  [AirdropStoreKeys.voters]?: string[];
  [AirdropStoreKeys.currentWalletIndex]?: number;
  [AirdropStoreKeys.jettonAddress]?: string;
  [AirdropStoreKeys.nftCollection]?: string;
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
  setProposals: (proposals: string[]) => void;
  selectProposal: (proposal: string) => void;
  setStep: (step: number) => void;
  incrementCurrentWalletIndex: () => void;
  setVoters: (voters: string[]) => void;
  nextStep: () => void;
  setDao: (dao: string) => void;
  setValues: (values: AirdropStoreValues) => void;
  setManuallySelectedVoters: (voters: string) => void;
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

export const useAirdropStore = create(
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
      setManuallySelectedVoters: (voter) => {
        const manuallySelectedVoters = get().manuallySelectedVoters || [];
        set({
          manuallySelectedVoters: manuallySelectedVoters?.includes(voter)
            ? _.without(manuallySelectedVoters, voter)
            : [...manuallySelectedVoters, voter],
        });
      },
      setValues: (values) => {
        set(values);      
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
      nextStep: () => {
        const step = get().step || 0;
        set({ step: step + 1 });
      },
      setVoters: (voters) => {
        set({ voters });
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
      setDao: (dao) => {
        const daos = get().daos || [];

        set({
          daos: daos.includes(dao) ? _.without(daos, dao) : [dao],
          proposals: [],
          manuallySelectedVoters: [],
          votersAmount: undefined,
        });
      },
      reset: () => set(initialState),
    }),
    {
      name: "airdrop",
    }
  )
);

interface AirdropStoreCompare {
  values: AirdropStoreValues;
  setValues: (values: AirdropStoreValues) => void;
}

export const useAirdropStoreCopy = create(
  persist<AirdropStoreCompare>(
    (set, get) => ({
      values: initialState,
      setValues: (values) => {
        set({ values });
      },
    }),
    {
      name: "airdrop-copy",
    }
  )
);
