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
import { ZERO_ADDRESS } from "consts";

const initialCreateMetadataForm: DaoMetadataForm = {
  name: "test",
  telegram: "https://reactdatepicker.com/",
  website: "https://reactdatepicker.com/",
  github: "https://reactdatepicker.com/",
  about: "https://reactdatepicker.com/",
  terms: "https://reactdatepicker.com/",
  avatar: "",
  hide: false,
  nft: "",
  jetton: "",
};

export interface DaoMetadataForm {
  name: string;
  website: string;
  about: string;
  telegram: string;
  terms: string;
  github: string;
  avatar: string;
  hide: boolean;
  jetton: string;
  nft: string;
}

export interface RolesForm {
  ownerAddress: string;
  proposalOwner: string;
}
interface State {
  step: number;
  setStep: (value: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  daoMetadataForm: DaoMetadataForm;
  rolesForm: RolesForm;
  metadataAddress?: string;
  setDaoMetadataForm: (value: DaoMetadataForm) => void;
  setMetadataAddress: (value: string) => void;
  setRolesForm: (rolesForm?: RolesForm) => void;
  reset: () => void;
}

export const useCreatDaoStore = create<State>((set, get) => ({
  rolesForm: {} as RolesForm,
  daoMetadataForm: initialCreateMetadataForm,
  step: 0,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  setDaoMetadataForm: (daoMetadataForm) => set({ daoMetadataForm }),
  setMetadataAddress: (metadataAddress) => set({ metadataAddress }),
  setRolesForm: (rolesForm) => set({ rolesForm }),
  reset: () => set({ daoMetadataForm: {} as DaoMetadataForm, step: 0 }),
}));

export const useCreateDaoMetadata = () => {
  const getSender = useGetSender();
  const { nextStep, setMetadataAddress, setDaoMetadataForm } = useCreatDaoStore();
  const toggleTxReminder = useTxReminderPopup().setOpen;

  return useMutation(
    async (values: DaoMetadataForm) => {
      const sender = getSender();

      const metadataArgs: MetadataArgs = {
        about: values.about,
        avatar: values.avatar || "",
        github: values.github,
        hide: values.hide,
        name: values.name,
        terms: values.terms,
        telegram: values.telegram,
        website: values.website,
        jetton: values.jetton || ZERO_ADDRESS,
        nft: values.nft || ZERO_ADDRESS,
      };
      console.log({ metadataArgs });
      
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
      if (typeof address === "string") {
        nextStep();
        setDaoMetadataForm(values);
        setMetadataAddress(address.toString());
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
    rolesForm: { ownerAddress, proposalOwner },
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
        ownerAddress,
        proposalOwner
      );

      showPromiseToast({
        promise,
        loading: "Transaction pending",
        success: "Dao created!",
      });
      toggleTxReminder(true);
      const address = await promise;
      if (typeof address === "string") {
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
