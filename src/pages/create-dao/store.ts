import { useMutation } from "@tanstack/react-query";
import { useConnectionStore } from "connection";
import { contract } from "data-service";
import { useMemo } from "react";
import { Address } from "ton-core";
import { InputInterface } from "types";
import { create } from "zustand";
import * as Yup from "yup";
import _ from "lodash";
import { useNotification } from "components";

const initialFormData: FormData = {
  name: "test",
  twitter: "https://reactdatepicker.com/",
  website: "https://reactdatepicker.com/",
  github: "https://reactdatepicker.com/",
  about: "https://reactdatepicker.com/",
  terms: "https://reactdatepicker.com/",
  ownerAddress: "",
  proposalOwner: "",
};

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
interface State {
  step: number;
  setStep: (value: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFormData: (value: FormData) => void;
  formData: FormData;
  metadataAddress?: Address;
  setMetadataAddress: (value: Address) => void;
  reset: () => void;
}

export const useCreatDaoStore = create<State>((set, get) => ({
  formData: initialFormData,
  step: 0,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  setFormData: (formData) => set({ formData }),
  setMetadataAddress: (metadataAddress) => set({ metadataAddress }),
  reset: () => set({ formData: {} as FormData, step: 0 }),
}));

export const steps = [
  { title: "Create Metadata", index: 0 },
  { title: "Create Dao", index: 1 },
];

export const useCreateMetadata = () => {
  const address = useConnectionStore().address;
  const { nextStep, setMetadataAddress, setFormData } = useCreatDaoStore();
  const { showNotification } = useNotification();

  return useMutation(
    async (values: FormData) => {
      const response = await contract.createMetadata(
        values.about,
        "",
        values.github,
        false,
        values.name,
        values.terms,
        values.twitter,
        values.website
      );
      console.log({ response });

      if (Address.isAddress(response)) {
        nextStep();
        setFormData(values);
        setMetadataAddress(response);
      }
    },
    {
      onError: (error: any) => {
        showNotification({ message: error.message, variant: "error" });
      },
    }
  );
};

export const useCreateDao = () => {
  const { metadataAddress, formData, reset } = useCreatDaoStore();
  const { showNotification } = useNotification();

  return useMutation(
    async () => {
      return contract.createDao(
        metadataAddress as Address,
        Address.parse(formData.ownerAddress),
        Address.parse(formData.proposalOwner)
      );
    },
    {
      onSuccess: reset,
      onError: (error: any) => {
        showNotification({ message: error.message, variant: "error" });
      },
    }
  );
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
