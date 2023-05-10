import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import _ from "lodash";
import { useGetSender } from "hooks";
import * as TonVoteContract from "ton-vote-contracts-sdk";
import {
  getClientV2,
  getDaoIndex,
  MetadataArgs,
  ReleaseMode,
} from "ton-vote-contracts-sdk";
import { showPromiseToast } from "toasts";
import { useAppNavigation } from "router/navigation";
import { useNewDataStore, useTxReminderPopup } from "store";
import { ZERO_ADDRESS } from "consts";
import { getTxFee, Logger } from "utils";
import { persist } from "zustand/middleware";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { BASE_FEE, getRelaseMode } from "config";
import { DaoMetadataForm, DaoRolesForm } from "types";
import { useGetCreateDaoFee, useSetDaoFwdMsgFee } from "query/queries";

const initialCreateMetadataForm: DaoMetadataForm = {
  name: "",
  telegram: "",
  website: "",
  github: "",
  about: "",
  about_en: "",
  terms: "",
  avatar: "",
  hide: false,
  nft: "",
  jetton: "",
  dns: "",
};

interface State {
  step: number;
  setStep: (value: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  daoMetadataForm: DaoMetadataForm;
  rolesForm: DaoRolesForm;
  metadataAddress?: string;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  setDaoMetadataForm: (value: DaoMetadataForm) => void;
  setMetadataAddress: (value: string) => void;
  setRolesForm: (rolesForm?: DaoRolesForm) => void;
  reset: () => void;
}

export const useCreatDaoStore = create(
  persist<State>(
    (set) => ({
      editMode: false,
      rolesForm: {} as DaoRolesForm,
      daoMetadataForm: initialCreateMetadataForm,
      step: 0,
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: state.step - 1 })),
      setEditMode: (editMode) => set({ editMode }),
      setDaoMetadataForm: (daoMetadataForm) => {
        set({ daoMetadataForm });
      },
      setMetadataAddress: (metadataAddress) => set({ metadataAddress }),
      setRolesForm: (rolesForm) => set({ rolesForm }),
      reset: () =>
        set({
          daoMetadataForm: {} as DaoMetadataForm,
          step: 0,
          rolesForm: {} as DaoRolesForm,
          editMode: false,
          metadataAddress: undefined,
        }),
    }),
    {
      name: "ton_vote_create_dao",
    }
  )
);

export const useCreateDaoMetadata = () => {
  const getSender = useGetSender();
  const { nextStep, setMetadataAddress, setDaoMetadataForm, editMode } =
    useCreatDaoStore();
  const toggleTxReminder = useTxReminderPopup().setOpen;
  const translations = useCreateDaoTranslations();
  return useMutation(
    async (values: DaoMetadataForm) => {
      const sender = getSender();

      const metadataArgs: DaoMetadataForm = {
        about: JSON.stringify({ en: values.about_en }),
        avatar: values.avatar || "",
        github: values.github || "",
        hide: values.hide,
        name: JSON.stringify({ en: values.name_en }),
        terms: "",
        telegram: values.telegram || "",
        website: values.website || "",
        jetton: values.jetton || ZERO_ADDRESS,
        nft: values.nft || ZERO_ADDRESS,
        dns: values.dns || "",
      };
      Logger(metadataArgs);

      const clientV2 = await getClientV2();
      const isMetadataExist = await TonVoteContract.metdataExists(
        clientV2,
        metadataArgs
      );
      const promise = TonVoteContract.newMetdata(
        sender,
        clientV2,
        BASE_FEE.toString(),
        metadataArgs
      );

      if (!isMetadataExist) {
        toggleTxReminder(true);
        showPromiseToast({
          promise,
          success: editMode
            ? translations.spaceDetailsUpdated
            : translations.spaceDetailsCreated,
        });
      }

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
  const { addDao } = useNewDataStore();
  const createDaoFee = useGetCreateDaoFee().data
  const {
    rolesForm: { ownerAddress, proposalOwner },
    metadataAddress,
    reset,
  } = useCreatDaoStore();

  const toggleTxReminder = useTxReminderPopup().setOpen;

  return useMutation(
    async () => {
      const sender = getSender();
      const clientV2 = await getClientV2();

      const promise = TonVoteContract.newDao(
        sender,
        clientV2,
        getRelaseMode(),
        getTxFee(createDaoFee),
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
      console.log({ address });

      if (typeof address === "string") {
        appNavigation.daoPage.root(address);
        addDao(address);
        reset();
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
    }
  );
};
