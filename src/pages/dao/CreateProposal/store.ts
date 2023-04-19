import { useMutation } from "@tanstack/react-query";
import { useDaoAddress, useGetSender } from "hooks";
import { useAppNavigation } from "router";
import { showPromiseToast } from "toasts";
import {
  getClientV2,
  newProposal,
  ProposalMetadata,
  VotingPowerStrategy,
} from "ton-vote-sdk";
import { create } from "zustand";
import { FormData } from "./form";
import { persist } from "zustand/middleware";
import { ZERO_ADDRESS } from "consts";
import { useProposlFromLocalStorage, useTxReminderPopup } from "store";
import { Address } from "ton-core";

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
  const toggleTxReminder = useTxReminderPopup().setOpen;
  const { addProposal } = useProposlFromLocalStorage();

  return useMutation(
    async ({
      daoAddr,
      formValues,
    }: {
      daoAddr: string;
      formValues: FormData;
    }) => {
      const jetton = formValues.votingPowerStrategy === VotingPowerStrategy
        .JettonBalance
        ? formValues.jetton
        : ZERO_ADDRESS;
      const nft = formValues.votingPowerStrategy === VotingPowerStrategy
        .NftCcollection
        ? formValues.nft
        : ZERO_ADDRESS;

        console.log(jetton, nft);
        

      try {
        Address.isAddress(jetton);
        Address.isAddress(nft);
      } catch (error) {
        throw new Error("Invalid address");
      }

      const proposalMetadata: Partial<ProposalMetadata> = {
        proposalStartTime: formValues.proposalStartTime! / 1_000,
        proposalEndTime: formValues.proposalEndTime! / 1_000,
        proposalSnapshotTime: formValues.proposalSnapshotTime! / 1_000,
        proposalType: 1,
        jetton,
        nft,
        title: formValues.title,
        description: formValues.description,
        votingPowerStrategy: formValues.votingPowerStrategy,
      };

      const sender = getSender();
      const clientV2 = await getClientV2();
      const promise = newProposal(
        sender,
        clientV2,
        daoAddr,
        proposalMetadata as ProposalMetadata
      );
      toggleTxReminder(true);
      showPromiseToast({
        promise,
        loading: "Creating Proposal",
        success: "Proposal Created",
      });

      const proposalAddress = await promise;

      if (typeof proposalAddress === "string") {
        appNavigation.proposalPage.root(daoAddress, proposalAddress);
        setFormData({} as FormData);
        addProposal(daoAddress, proposalAddress);
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
    }
  );
};
