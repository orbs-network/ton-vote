import { create } from "zustand";

interface State {
  step: number;
  setStep: (value: number) => void;
}

export const useCreateSpaceStore = create<State>((set, get) => ({
  step: 0,
  setStep: (step) => set({ step }),
}));


export const steps = [
  { title: "Getting Started", index: 0 },
  { title: "ENS", index: 1 },
  { title: "Profile", index: 2 },
  { title: "Strategy", index: 3 },
];