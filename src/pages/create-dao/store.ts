import { create } from "zustand";

export interface FormData {
  name: string;
  website: string;
  about: string;
  twitter: string;
  terms: string;
  github: string;
}

interface State {
  formData: FormData;
  avatar?: File;
  setFormData: (name: string, value: string) => void;
  setAvatar: (avatar: File) => void;
}

export const useCreatDaoStore = create<State>((set, get) => ({
  formData: {} as FormData,
  setAvatar: (avatar) => set({ avatar }),
  setFormData: (name, value) =>
    set({ formData: { ...get().formData, [name]: value } }),
}));

export const steps = [
  { title: "Getting Started", index: 0 },
  { title: "ENS", index: 1 },
  { title: "Profile", index: 2 },
  { title: "Strategy", index: 3 },
];
