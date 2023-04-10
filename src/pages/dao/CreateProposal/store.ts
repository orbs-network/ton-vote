import { useMutation } from "@tanstack/react-query";
import { useDaoAddress, useGetSender } from "hooks";
import { useClientsQuery } from "query/queries";
import { useAppNavigation } from "router";
import { showErrorToast, showPromiseToast } from "toasts";
import { Address } from "ton-core";
import { ProposalMetadata } from "ton-vote-sdk";
import { create } from "zustand";
import { FormData } from "./form";
import * as TonVoteSDK from "ton-vote-sdk";
import moment from "moment";

interface Store {
  preview: boolean;
  setPreview: (value: boolean) => void;
  formData: FormData;
  setFormData: (value: FormData) => void;
}
export const useCreateProposalStore = create<Store>((set) => ({
  preview: false,
  setPreview: (preview) => set({ preview }),
  formData: { title: "", description: "" } as FormData,
  setFormData: (formData) => set({ formData }),
}));

export const useCreateProposal = () => {
  const daoAddress = useDaoAddress();
  const getSender = useGetSender();
  const clientV2 = useClientsQuery()?.clientV2;
  const appNavigation = useAppNavigation();

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

      const proposalMetadata: ProposalMetadata = {
        proposalStartTime: BigInt(formValues.proposalStartTime! / 1000),
        proposalEndTime: BigInt(formValues.proposalEndTime! / 1000),
        proposalSnapshotTime: BigInt(formValues.proposalSnapshotTime! / 1000),
        votingPowerStrategy: BigInt(1),
        proposalType: BigInt(1),
      };

      const sender = getSender();

      const promise = TonVoteSDK.newProposal(
        sender,
        clientV2!,
        Address.parse(daoAddr),
        proposalMetadata
      );

      showPromiseToast({
        promise,
        loading: "Transaction pending...",
        success: "Proposal Created",
      });

      const address = await promise;

      if (Address.isAddress(address)) {
        appNavigation.proposalPage.root(daoAddress, address.toString());
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
