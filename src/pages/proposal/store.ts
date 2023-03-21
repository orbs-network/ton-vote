import { create } from "zustand";

interface ProposalStore {
  txLoading: boolean;
  setTxLoading: (value: boolean) => void;
}

export interface VoteStore {
  setVote: (vote?: string) => void;
  vote?: string;
}

export const useProposalStore = create<ProposalStore>((set, get) => ({
  txLoading: false,
  setTxLoading: (txLoading) => set({ txLoading }),
}));

export const useVoteStore = create<VoteStore>((set, get) => ({
  vote: undefined,
  setVote: (vote) => set({ vote }),
}));
