import { useMutation } from "@tanstack/react-query";
import { useDaoAddressFromQueryParam, useGetSender } from "hooks";
import { useAppNavigation } from "router/navigation";
import { showErrorToast, showPromiseToast } from "toasts";
import {
  getClientV2,
  newProposal,
  ProposalMetadata,
} from "ton-vote-contracts-sdk";
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
