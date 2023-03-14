import { Transaction } from "types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProposalState {
  contractMaxLt?: string;
  transactions: Transaction[];
  serverMaxLt?: string;
  serverUpdateTime?: number;
  txLoading: boolean;
}
interface ProposalStore extends ProposalState {
  reset: () => void;

  setContractMaxLt: (value?: string) => void;
  addContractTransactions: (value: Transaction[]) => Transaction[];
  setServerMaxLt: (value?: string) => void;
  setServerUpdateTime: (value?: number) => void;
  setTxLoading: (value: boolean) => void;
}

export interface VoteStore {
  setVote: (vote?: string) => void;
  vote?: string;
}

const proposalInitialState: ProposalState = {
  transactions: [],
  contractMaxLt: undefined,
  serverUpdateTime: undefined,
  serverMaxLt: undefined,
  txLoading: false,
};

export const useProposalStore = create<ProposalStore>((set, get) => ({
  ...proposalInitialState,
  reset: () => set(proposalInitialState),
  setContractMaxLt: (contractMaxLt) => set({ contractMaxLt }),
  addContractTransactions: (newTransactions) => {
    const transactions = get().transactions;
    transactions.unshift(...newTransactions);
    set({ transactions });
    return transactions;
  },
  setServerUpdateTime: (serverUpdateTime) => set({ serverUpdateTime }),
  setServerMaxLt: (serverMaxLt) => set({ serverMaxLt }),

  setTxLoading: (txLoading) => set({ txLoading }),
}));

export const useVoteStore = create<VoteStore>((set, get) => ({
  vote: undefined,
  setVote: (vote) => set({ vote }),
}));

export interface ProposalPersistStore {
  maxLt?: string;
  setMaxLt: (value: string) => void;
  clearMaxLt: () => void;
}

export const useProposalPersistStore = create(
  persist<ProposalPersistStore>(
    (set) => ({
      maxLt: undefined,
      setMaxLt: (maxLt) => set({ maxLt }),
      clearMaxLt: () => set({ maxLt: undefined }),
    }),
    {
      name: "ton_vote_max_lt", // name of the item in the storage (must be unique)
    }
  )
);
