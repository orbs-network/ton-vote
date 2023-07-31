import { useMutation, useQuery } from "@tanstack/react-query";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import _ from "lodash";
import { useAirdropStore } from "pages/airdrop/store";
import { VoterSelectionMethod } from "pages/airdrop/types";
import { useGetAllProposalsCallback, useGetClientsCallback } from "query/getters";
import { useErrorToast } from "toasts";
import { chooseRandomVoters } from "ton-vote-contracts-sdk";
import { useVotersSelectContext } from "./context";
import { VotersSelectForm } from "./form";

export const useAirdropVotersQuery = () => {
  const getVotes = useGetAirdropVotes();
  const { proposals } = useVotersSelectContext();

  const _proposals = proposals || [];

  return useQuery(["useAirdropVotersQuery", ..._proposals], async () => {
    const votes = await getVotes();
    
    return _.keys(votes);
  });
};



export const useGetAirdropVotes = () => {
  const getProposals = useGetAllProposalsCallback();
  const { proposals } = useVotersSelectContext();

  return async () => {
    const result = await getProposals(proposals);

    let votes = {};
    result.forEach((proposal) => {
      votes = {
        ...votes,
        ...proposal?.rawVotes,
      };
    });

    return votes;
  };
};


export const useVotersSelectSubmit = () => {
  const errorToast = useErrorToast();
  const context = useVotersSelectContext();
  const store = useAirdropStore();
  const getVotes = useGetAirdropVotes();
  const getClients = useGetClientsCallback();
  const t = useAirdropTranslations();

  return useMutation(
    async (formData: VotersSelectForm) => {
      if (_.isEmpty(context.proposals)) {
        throw new Error("Select at least one proposal");
      }

      if (formData.selectionMethod === VoterSelectionMethod.MANUALLY) {
        if (_.isEmpty(context.manuallySelectedVoters)) {
          throw new Error("Select at least one voter manually");
        }
        return context.manuallySelectedVoters;
      }

      const votes = await getVotes();

      if (formData.selectionMethod === VoterSelectionMethod.ALL) {
        return _.keys(votes);
      }
      const clientV4 = (await getClients()).clientV4;

      if (!votes) {
        throw new Error("Something went wrong");
      }

      const randomVotersAmount = formData.votersAmount || 0;

      if (
        randomVotersAmount === store.votersAmount &&
        !_.isEmpty(store.voters)
      ) {
        return store.voters;
      }

      if (_.size(votes) < randomVotersAmount) {
        throw new Error(
          t.errors.maxVotersAmount(_.size(votes).toLocaleString())
        );
      }

      const result = await chooseRandomVoters(
        clientV4,
        votes,
        randomVotersAmount
      );

      if (_.size(result) === 0) {
        throw new Error("Something went wrong");
      }
      return result;
    },
    {
      onSuccess: (voters, args) => {
        store.setValues({
          voters,
          votersAmount: args.votersAmount,
          selectionMethod: args.selectionMethod,
          manuallySelectedVoters: context.manuallySelectedVoters,
          daos: context.daos,
          proposals: context.proposals,
        });
        store.nextStep();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};
