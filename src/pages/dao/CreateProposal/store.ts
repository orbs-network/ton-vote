import { useMutation } from "@tanstack/react-query";
import { useDaoAddress, useGetSender } from "hooks";
import { useAppNavigation } from "router";
import { showErrorToast, showPromiseToast } from "toasts";
import {
  getClientV2,
  newProposal,
  ProposalMetadata,
  VotingPowerStrategy,
} from "ton-vote-contracts-sdk";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ZERO_ADDRESS } from "consts";
import { useNewDataStore, useTxReminderPopup } from "store";
import { Address } from "ton-core";
import { useConnection } from "ConnectionProvider";
import { isOwner } from "utils";
import { useDaoQuery } from "query/queries";
import { CreateProposalForm, CreateProposalStore } from "./types";


export const useCreateProposalStore = create(
  persist<CreateProposalStore>(
    (set) => ({
      preview: false,
      setPreview: (preview) => set({ preview }),
      formData: {} as CreateProposalForm,
      setFormData: (formData) => set({ formData }),
    }),
    {
      name: "ton-vote-create-proposal",
    }
  )
);

export const useCreateProposal = () => {
  const daoAddress = useDaoAddress();
  const daoRoles = useDaoQuery(daoAddress).data?.daoRoles;
  const getSender = useGetSender();
  const appNavigation = useAppNavigation();
  const setFormData = useCreateProposalStore((state) => state.setFormData);
  const toggleTxReminder = useTxReminderPopup().setOpen;
  const { addProposal } = useNewDataStore();
  const connectedWallet = useConnection().address;

  return useMutation(
    async ({
      daoAddr,
      formValues,
    }: {
      daoAddr: string;
      formValues: CreateProposalForm;
    }) => {
      if (!isOwner(connectedWallet, daoRoles)) {
        showErrorToast("Only Dao owner can create proposal");
        return;
      }
      const jetton =
        formValues.votingPowerStrategy === VotingPowerStrategy.JettonBalance
          ? formValues.jetton
          : ZERO_ADDRESS;
      const nft =
        formValues.votingPowerStrategy === VotingPowerStrategy.NftCcollection
          ? formValues.nft
          : ZERO_ADDRESS;

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
        description: JSON.stringify({ en: formValues.description }),
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
        setFormData({} as CreateProposalForm);
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
