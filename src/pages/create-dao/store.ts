import { useMutation } from "@tanstack/react-query";
import { contract } from "data-service";
import { create } from "zustand";

interface State {
  step: number;
  setStep: (value: number) => void;
  avatar?: File;
  setAvatar: (value?: File) => void;
}

export interface FormData {
  name: string;
  website: string;
  about: string;
  twitter: string;
  terms: string;
  github: string;
}

export const useCreatDaoStore = create<State>((set, get) => ({
  step: 0,
  setStep: (step) => set({ step }),
  setAvatar: (avatar) => set({ avatar }),
}));

export const steps = [
  { title: "Set avatar", index: 0 },
  { title: "ENS", index: 1 },
  { title: "Profile", index: 2 },
  { title: "Strategy", index: 3 },
];

interface CreateDaoArgs {
  values: FormData;
  avatar?: File;
}

export const useCreateDao = () => {
  return useMutation(async (args: CreateDaoArgs) => {
    console.log(args.values);

    const { values, avatar } = args;
    const hide = false;
    return contract.createMetadata(
      values.about,
      "",
      values.github,
      hide,
      values.name,
      values.terms,
      values.twitter,
      values.website
    );
  });
};
