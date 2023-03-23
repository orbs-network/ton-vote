import { useMutation } from "@tanstack/react-query";
import { useConnectionStore } from "connection";
import { contract } from "data-service";
import { Address } from "ton-core";
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
  ownerAddress: string;
  proposalOwner: string;
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
  const address = useConnectionStore().address;
  return useMutation(async (args: CreateDaoArgs) => {

    const { values, avatar } = args;
    const hide = false;
    const metadata = await contract.createMetadata(
      values.about,
      "",
      values.github,
      hide,
      values.name,
      values.terms,
      values.twitter,
      values.website
    );

    if (!metadata || !address) {
      return null;
    }

    return contract.createDao(
      metadata as Address,
      Address.parse(values.ownerAddress),
      Address.parse(values.proposalOwner)
    );
  });
};
