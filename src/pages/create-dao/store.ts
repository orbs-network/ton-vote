import { create } from "zustand";
import _ from "lodash";
import { DaoMetadataForm, DaoRolesForm } from "types";
import { persist } from "zustand/middleware";

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
  daoAddress?: string;
  setDaoAddress: (value: string) => void;
  createDaoSuccessModal: boolean;
  setCreateDaoSuccessModal: (value: boolean) => void;
  createOnDev: boolean;
  setCreateOnDev: (value: boolean) => void;
}

export const useCreatDaoStore = create(
  persist<State>(
    (set) => ({
      createOnDev: true,
      setCreateOnDev: (createOnDev) => set({ createOnDev }),
      createDaoSuccessModal: false,
      setCreateDaoSuccessModal: (createDaoSuccessModal) =>
        set({ createDaoSuccessModal }),
      editMode: false,
      rolesForm: {} as DaoRolesForm,
      daoMetadataForm: initialCreateMetadataForm,
      step: 0,
      setDaoAddress: (daoAddress) => set({ daoAddress }),
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
