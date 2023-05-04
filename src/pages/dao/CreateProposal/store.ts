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
import {
  CreateProposalForm,
  CreateProposalStore,
  StrategyValue,
} from "./types";
import { STRATEGIES } from "./strategies";
import _ from "lodash";
import { Dao } from "types";
import moment from "moment";

const initialChoices = ["Yes", "No", "Abstain"];

export const useFormInitialValues = (
  formData: CreateProposalForm,
  dao?: Dao
): CreateProposalForm => {
  const proposalStartTime = moment()
    .add("1", "day")
    .set("h", 15)
    .set("minute", 0).valueOf();

  const proposalEndTime = moment(proposalStartTime).add("7", "days").valueOf();
  const proposalSnapshotTime = moment(proposalStartTime).subtract('1', 'day').valueOf();
  return {
    proposalStartTime:
      formData.proposalStartTime || proposalStartTime,
    proposalEndTime: formData.proposalEndTime || proposalEndTime,
    proposalSnapshotTime: formData.proposalSnapshotTime || proposalSnapshotTime,
    votingPowerStrategy: formData.votingPowerStrategy || 0,
    votingChoices: formData.votingChoices || initialChoices,
    description_en: formData.description_en,
    description_ru: formData.description_ru,
    votingSystemType: formData.votingSystemType || 0,
    title_en: formData.title_en,
    strategy: handleInitialStrategy(formData.strategy, dao),
  };
};

export const handleInitialStrategy = (value?: string, dao?: Dao) => {
  if (value) {
    return value;
  }

  let type = [_.first(_.keys(STRATEGIES)) || ""];
  let args = [["ton-balance"]];

  if (dao?.daoMetadata.jetton) {
    type = ["jetton-balance"];
    args = [[dao.daoMetadata.jetton]];
  } else if (dao?.daoMetadata.nft) {
    type = ["nft-number"];
    args = [[dao.daoMetadata.nft]];
  }
  const newValue: StrategyValue = {
    type,
    args,
  };
  return JSON.stringify(newValue);
};

export const parseStrategyJSON = (value?: string): StrategyValue => {
  let parsed: StrategyValue = { type: [], args: [[]] };

  if (!value) return parsed;
  try {
    parsed = JSON.parse(value);
  } catch (error) {}
  return parsed;
};

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

      const parsedStrategy = parseStrategyJSON(formValues.strategy);
      let votingPowerStrategy;

      // switch (parsedStrategy.type) {
      //   case "ton-balance":
      //     votingPowerStrategy = 0;
      //   case "jetton-balance":
      //     votingPowerStrategy = 1;
      //   case "nft-number":
      //     votingPowerStrategy = 2;
      // }

      const proposalMetadata: Partial<ProposalMetadata> = {
        proposalStartTime: formValues.proposalStartTime! / 1_000,
        proposalEndTime: formValues.proposalEndTime! / 1_000,
        proposalSnapshotTime: formValues.proposalSnapshotTime! / 1_000,
        votingSystem: {
          votingSystemType: formValues.votingSystemType,
          choices: formValues.votingChoices.map((it) => it.value),
        },
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
