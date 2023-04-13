
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProposalStore {
  txLoading: boolean;
  setTxLoading: (value: boolean) => void;
}


export const useProposalStore = create<ProposalStore>((set, get) => ({
  txLoading: false,
  setTxLoading: (txLoading) => set({ txLoading }),
}));

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

export const useLatestMaxLtAfterTx = (address: string) => {
  const latestMaxLtAfterTx = useProposalPersistedStore(
    (store) => store.latestMaxLtAfterTx || {}
  );

  return latestMaxLtAfterTx[address];
};



