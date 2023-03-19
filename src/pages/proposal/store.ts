import { TonTransaction } from "ton";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProposalState {
  serverUpdateTime?: number;
  txLoading: boolean;
}
interface ProposalStore extends ProposalState {
  reset: () => void;
  setServerUpdateTime: (value?: number) => void;
  setTxLoading: (value: boolean) => void;
}

export interface VoteStore {
  setVote: (vote?: string) => void;
  vote?: string;
}

const proposalInitialState: ProposalState = {
  serverUpdateTime: undefined,
  txLoading: false,
};

export const useProposalStore = create<ProposalStore>((set, get) => ({
  ...proposalInitialState,
  reset: () => set(proposalInitialState),
  setServerUpdateTime: (serverUpdateTime) => set({ serverUpdateTime }),
  setTxLoading: (txLoading) => set({ txLoading }),
}));

export const useVoteStore = create<VoteStore>((set, get) => ({
  vote: undefined,
  setVote: (vote) => set({ vote }),
}));

export interface ProposalPersistStore {
  latestMaxLtAfterTx: { [key: string]: string | undefined };
  setLatestMaxLtAfterTx: (contractAddress: string, value?: string) => void;
}

export const useProposalPersistStore = create(
  persist<ProposalPersistStore>(
    (set, get) => ({
      latestMaxLtAfterTx: {},
      setLatestMaxLtAfterTx: (contractAddress, value) => {
        const prev = { ...get().latestMaxLtAfterTx, [contractAddress]: value };
        set({
          latestMaxLtAfterTx: prev,
        });
      },
    }),
    {
      name: "ton_vote_max_lt", // name of the item in the storage (must be unique)
    }
  )
);
