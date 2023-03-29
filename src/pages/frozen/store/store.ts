import { create } from "zustand";

import { VoteStore } from "./types";

export const useVoteStore = create<VoteStore>((set, get) => ({
  vote: undefined,

  setVote: (vote) => set({ vote }),
}));
