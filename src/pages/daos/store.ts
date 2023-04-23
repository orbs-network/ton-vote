import { create } from "zustand";

interface Store {
  limit: number;
  loadMore: () => void;
}


export const DAOS_LIMIT = 12

export const useDaosListLimit = create<Store>((set, get) => ({
  limit: DAOS_LIMIT,
  loadMore: () =>
    set((state) => {
      return { limit: state.limit + DAOS_LIMIT };
    }),
}));
