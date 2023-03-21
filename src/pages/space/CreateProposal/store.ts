import { useMutation } from "@tanstack/react-query";
import { delay } from "@ton-defi.org/ton-connection";
import { useNotification } from "components";
import { contract } from "data-service";
import { create } from "zustand";

interface State {
  title: string;
  description: string;
  discussion: string;
  errors: { [key: string]: boolean };
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setDiscussion: (value: string) => void;
  setErrors: (value: { [key: string]: boolean }) => void;
}

const initialState = {
  title: "",
  description: "",
  discussion: "",
  errors: {},
};

export const useCreateProposalStore = create<State>((set, get) => ({
  ...initialState,
  step: 0,
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setDiscussion: (discussion) => set({ discussion }),
  setErrors: (errors) => set({ errors: { ...get().errors, ...errors } }),
}));

type CreateProposalArgs = {
  title: string;
  description: string;
  discussion: string;
};

export const useCreateProposal = () => {
  const { showNotification } = useNotification();
  return useMutation(
    async (args: CreateProposalArgs) => {
      await delay(2000);
      return contract.createProposal(
        args.title,
        args.description,
        args.discussion
      );
    },
    {
      onSuccess: () => {
        showNotification({ variant: "success", message: "Proposal created" });
      },
    }
  );
};
