import { useMutation } from "@tanstack/react-query";
import { useDaoAddress, useGetSender } from "hooks";
import { useAppNavigation } from "router/navigation";
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
import {
  CreateProposalForm,
  CreateProposalStore,
  StrategyValue,
} from "./types";
import { STRATEGIES } from "./strategies";
import _ from "lodash";

export const STRATEGY_TYPE = "type";
export const STRATEGY_DATA = "data";

export const parseStrategyJSON = (value?: string): StrategyValue => {
  let parsed = { type: "", data: {} };

  if (!value) return parsed;
  try {
    parsed = JSON.parse(value);
  } catch (error) {}
  return parsed;
};

export const handleInitialStrategy = (value?: string) => {
  if (value) {
    return value;
  }
  return JSON.stringify({ type: _.first(_.keys(STRATEGIES)), data: {} });
};

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

      const parsedStrategy = parseStrategyJSON(formValues.strategy);
      let votingPowerStrategy;

      switch (parsedStrategy.type) {
        case "ton-balance":
          votingPowerStrategy = 0;
        case "jetton-balance":
          votingPowerStrategy = 1;
        case "nft-number":
          votingPowerStrategy = 2;
      }

      const proposalMetadata: Partial<ProposalMetadata> = {
        proposalStartTime: formValues.proposalStartTime! / 1_000,
        proposalEndTime: formValues.proposalEndTime! / 1_000,
        proposalSnapshotTime: formValues.proposalSnapshotTime! / 1_000,
        votingSystem: {
          votingSystemType: formValues.votingSystemType,
          choices: formValues.votingChoices.map((it) => it.value),
        },
        jetton: parsedStrategy.data["jetton"] || ZERO_ADDRESS,
        nft: parsedStrategy.data["nft"] || ZERO_ADDRESS,
        title: JSON.stringify({ en: formValues.title_en }),
        description: JSON.stringify({ en: formValues.description_en }),
        votingPowerStrategy,
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
