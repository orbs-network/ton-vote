import { useMutation } from "@tanstack/react-query";
import { useDaoAddress, useGetSender } from "hooks";
import { useAppNavigation } from "router/navigation";
import { showErrorToast, showPromiseToast } from "toasts";
import {
  getClientV2,
  newProposal,
  ProposalMetadata,
} from "ton-vote-contracts-sdk";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useNewDataStore, useTxReminderPopup } from "store";
import { useConnection } from "ConnectionProvider";
import { isOwner } from "utils";
import { useDaoQuery } from "query/queries";
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

      const proposalMetadata: Partial<ProposalMetadata> = {
        proposalStartTime: Math.floor(formValues.proposalStartTime! / 1_000),
        proposalEndTime: Math.floor(formValues.proposalEndTime! / 1_000),
        proposalSnapshotTime: Math.floor(formValues.proposalSnapshotTime! / 1_000),
        votingSystem: {
          votingSystemType: formValues.votingSystemType,
          choices: formValues.votingChoices.map((it) => it.value),
        },
        title: JSON.stringify({ en: formValues.title_en }),
        description: JSON.stringify({ en: formValues.description_en }),
        votingPowerStrategies: formValues.votingPowerStrategies,
      };

      console.log(proposalMetadata);
      

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
