import _ from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";


export enum AirdropFormsKeys {
  votersAmount = "votersAmount",
  jettonsAmount = "jettonsAmount",
  jettonAddress = "jettonAddress",
  nftAddress = "nftAddress",
  assetType = "assetType",
  selectionMethod = "selectionMethod",
  manuallySelectedVoters = "manuallySelectedVoters",
}

export interface AirdropForm {
  [AirdropFormsKeys.votersAmount]?: number;
  [AirdropFormsKeys.jettonsAmount]?: number;
  [AirdropFormsKeys.jettonAddress]?: string;
  [AirdropFormsKeys.assetType]?: "nft" | "jetton";
  [AirdropFormsKeys.selectionMethod]?: number;
  [AirdropFormsKeys.manuallySelectedVoters]: string[];
  [AirdropFormsKeys.nftAddress]?: string;
}


interface AirdropInit {
  voters: string[];
  jettonAddress: string;
  jettonsAmount: number;
  type: "jetton" | "nft";
  votersSelectionMethod: number;
}




interface AirdropStore {
  reset: () => void;
  setProposals: (proposals: string[]) => void;
  selectProposal: (proposal: string) => void;
  setStep: (step: number) => void;
  initAirdrop: (values: AirdropInit) => void;
  incrementCurrentWalletIndex: () => void;
  deleteProposal: (proposal: string) => void;
  setVoters: (voters: string[]) => void;
  nextStep: () => void;
  setDao: (dao: string) => void;
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

const initialState = {
  voters: undefined,
  currentWalletIndex: undefined,
  jettonAddress: undefined,
  jettonsAmount: undefined,
  type: undefined,
  daos: undefined,
  proposals: undefined,
  step: undefined,
  votersSelectionMethod: undefined,
};

export const useAirdropStore = create(
  persist<AirdropStore>(
    (set, get) => ({
      selectProposal: (proposal) => {
        const proposals = get().proposals || [];
        set({
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
      deleteProposal: (proposal) => {
        const proposals = get().proposals || [];
        set({ proposals: _.without(proposals, proposal) });
      },
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
      setDao: (dao) => {
        set({ daos: [dao] });
      },
      reset: () => set(initialState),
    }),
    {
      name: "airdrop",
    }
  )
);
