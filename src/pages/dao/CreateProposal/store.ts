import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CreateProposalForm, CreateProposalStore } from "./types";
import _ from "lodash";

export const useCreateProposalStore = create(
  persist<CreateProposalStore>(
    (set) => ({
      formData: {} as CreateProposalForm,
      setFormData: (formData) => set({ formData }),
    }),
    {
      name: "ton-vote-create-proposal",
    }
  )
);
