import { useMutation } from "@tanstack/react-query";
import { useDaoAddress, useGetSender } from "hooks";
import { useAppNavigation } from "router";
import { showErrorToast, showPromiseToast } from "toasts";
import { getClientV2, ProposalMetadata } from "ton-vote-sdk";
import { create } from "zustand";
import { FormData } from "./form";
import * as TonVoteSDK from "ton-vote-sdk";
import moment from "moment";
import { persist } from "zustand/middleware";

interface Store {
  preview: boolean;
  setPreview: (value: boolean) => void;
  formData: FormData;
  setFormData: (value: FormData) => void;
}
export const useCreateProposalStore = create(
  persist<Store>(
    (set) => ({
      preview: false,
      setPreview: (preview) => set({ preview }),
      formData: { title: "", description: "" } as FormData,
      setFormData: (formData) => set({ formData }),
    }),
    {
      name: "ton_vote_create_proposal",
    }
  )
);

export const useCreateProposal = () => {
  const daoAddress = useDaoAddress();
  const getSender = useGetSender();
  const appNavigation = useAppNavigation();
  const setFormData = useCreateProposalStore((state) => state.setFormData);

  return useMutation(
    async ({
      daoAddr,
      formValues,
    }: {
      daoAddr: string;
      formValues: FormData;
    }) => {
      const error = validateFormData(formValues);
      if (error) {
        showErrorToast(error);
        return;
      }

      const proposalMetadata: Partial<ProposalMetadata> = {
        proposalStartTime: formValues.proposalStartTime! / 1_000,
        proposalEndTime: formValues.proposalEndTime! / 1_000,
        proposalSnapshotTime: formValues.proposalSnapshotTime! / 1_000,
        votingPowerStrategy: 1,
        proposalType: 1,
      };

      const sender = getSender();
      const clientV2 = await getClientV2()
      const promise = TonVoteSDK.newProposal(
        sender,
        clientV2,
        daoAddr,
        proposalMetadata as ProposalMetadata
      );

      showPromiseToast({
        promise,
        loading: "Transaction pending...",
        success: "Proposal Created",
      });

      const address = await promise;

      if (typeof address === "string") {
        appNavigation.proposalPage.root(daoAddress, address);
        setFormData({} as FormData);
      } else {
        throw new Error("Something went wrong");
      }
    }
  );
};

const validateFormData = (data: FormData) => {
  if (data.proposalStartTime! < moment().valueOf()) {
    return "Proposal start time must be greater than current time";
  }
  if (data.proposalSnapshotTime! >= data.proposalStartTime!) {
    return "Proposal snapshot time must be less than proposal start time";
  }
  if (data.proposalStartTime! >= data.proposalEndTime!) {
    return "Proposal start time must be less than proposal end time";
  }
};
