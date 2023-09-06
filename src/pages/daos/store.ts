import { create } from "zustand";

interface Store {
  limit: number;
  loadMore: () => void;
}


