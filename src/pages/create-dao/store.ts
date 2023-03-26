import { useMutation } from "@tanstack/react-query";
import { useConnectionStore } from "connection";
import { contract } from "data-service";
import { useMemo } from "react";
import { Address } from "ton-core";
import { InputInterface } from "types";
import { create } from "zustand";
import * as Yup from "yup";

interface State {
  step: number;
  setStep: (value: number) => void;
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
  avatar?: File;
}

export const useCreatDaoStore = create<State>((set, get) => ({
  step: 0,
  setStep: (step) => set({ step }),
}));

export const steps = [
  { title: "Set avatar", index: 0 },
  { title: "ENS", index: 1 },
  { title: "Profile", index: 2 },
  { title: "Strategy", index: 3 },
];

interface CreateDaoArgs {
  values: FormData;
}

export const useCreateDao = () => {
  const address = useConnectionStore().address;
  return useMutation(async (args: CreateDaoArgs) => {
    const { values } = args;
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

export const useInputs = (): InputInterface[] => {
  const address = useConnectionStore((store) => store.address);
  return useMemo(() => {
    return [
      {
        label: "Avatar",
        type: "upload",
        name: "avatar",
      },

      {
        label: "Name",
        type: "text",
        name: "name",
      },
      {
        label: "Github",
        type: "url",
        name: "github",
      },
      {
        label: "Twitter",
        type: "url",
        name: "twitter",
      },
      {
        label: "Website",
        type: "url",
        name: "website",
      },
      {
        label: "About",
        type: "text",
        name: "about",
      },
      {
        label: "Terms",
        type: "url",
        name: "terms",
      },
      {
        label: "Owner Address",
        type: "text",
        name: "ownerAddress",
        defaultValue: address,
      },
      {
        label: "Proposal Owner Address",
        type: "text",
        name: "proposalOwner",
        defaultValue: address,
      },
    ];
  }, [address]);
};

export const FormSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  github: Yup.string().url("invalid URL").required("Required"),
  website: Yup.string().url("invalid URL").required("Required"),
  twitter: Yup.string().url("invalid URL").required("Required"),
  about: Yup.string().url("invalid URL").required("Required"),
  terms: Yup.string().url("invalid URL").required("Required"),
  ownerAddress: Yup.string().required("Required"),
  proposalOwner: Yup.string().required("Required"),
});
