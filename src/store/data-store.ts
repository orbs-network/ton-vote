import { create } from "zustand";

interface State {
  page?: { fromLt: string; hash: string };
  setPage: (value?: { fromLt: string; hash: string }) => void;
}

export const useDataStore = create<State>((set, get) => ({
  setPage: (page) => set({ page }),
}));

export const useTransactionsPage = () => {
    const page = useDataStore().page;
    const setPage = useDataStore().setPage;

    return {
      page,
      setPage,
    };
}