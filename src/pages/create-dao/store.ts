import { useMutation } from "@tanstack/react-query";
import { Address } from "ton-core";
import { create } from "zustand";
import _ from "lodash";
import { useGetSender } from "hooks";
import * as TonVoteContract from "ton-vote-sdk";
import { getClientV2, MetadataArgs } from "ton-vote-sdk";
import { showPromiseToast } from "toasts";
import { useAppNavigation } from "router";
import { useTxReminderPopup } from "store";

const initialFormData: FormData = {
  name: "test",
  twitter: "https://reactdatepicker.com/",
  website: "https://reactdatepicker.com/",
  github: "https://reactdatepicker.com/",
  about: "https://reactdatepicker.com/",
  terms: "https://reactdatepicker.com/",
  ownerAddress: "",
  proposalOwner: "",
  avatar: "",
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
  avatar: string;
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

export const useCreateDaoMetadata = () => {
  const getSender = useGetSender();
  const { nextStep, setMetadataAddress, setFormData } = useCreatDaoStore();
  const toggleTxReminder = useTxReminderPopup().setOpen;

  return useMutation(
    async (values: FormData) => {
      const sender = getSender();

      const metadataArgs: MetadataArgs = {
        about: values.about,
        avatar: values.avatar || "",
        github: values.github,
        hide: false,
        name: values.name,
        terms: values.terms,
        twitter: values.twitter,
        website: values.website,
      };
      toggleTxReminder(true);
      const clientV2 = await getClientV2();
      const promise = TonVoteContract.newMetdata(
        sender,
        clientV2,
        metadataArgs
      );

      showPromiseToast({
        promise,
        success: "Metadata created!",
      });

      const address = await promise;
      if (Address.isAddress(address)) {
        nextStep();
        setFormData(values);
        setMetadataAddress(address);
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
      onSuccess: () => {
        window.scrollTo(0, 0);
      },
    }
  );
};

export const useCreateDao = () => {
  const getSender = useGetSender();
  const appNavigation = useAppNavigation();
  const {
    formData: { ownerAddress, proposalOwner },
    metadataAddress,
  } = useCreatDaoStore();

  const toggleTxReminder = useTxReminderPopup().setOpen;

  return useMutation(
    async () => {
      const sender = getSender();
      const clientV2 = await getClientV2();
      const promise = TonVoteContract.newDao(
        sender,
        clientV2,
        metadataAddress!,
        Address.parse(ownerAddress),
        Address.parse(proposalOwner)
      );

      showPromiseToast({
        promise,
        loading: "Transaction pending",
        success: "Dao created!",
      });
      toggleTxReminder(true);
      const address = await promise;
      if (Address.isAddress(address)) {
        appNavigation.daoPage.root(address.toString());
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
    }
  );
};
