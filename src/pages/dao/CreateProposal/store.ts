import { create } from "zustand";
import { persist } from "zustand/middleware";
import {  CreateProposalStore } from "./types";
import _ from "lodash";
import { ProposalForm } from "types";

export const useCreateProposalStore = create(
  persist<CreateProposalStore>(
    (set) => ({
      formData: {} as ProposalForm,
      setFormData: (formData) => set({ formData }),
    }),
    {
      name: "ton-vote-create-proposal",
    }
  )
);
