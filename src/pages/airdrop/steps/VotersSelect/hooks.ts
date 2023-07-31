import { useMutation, useQuery } from "@tanstack/react-query";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import _ from "lodash";
import { useAirdropPersistStore, useVotersSelectStore } from "pages/airdrop/store";
import { VoterSelectionMethod } from "pages/airdrop/types";
import {
  useDaoQuery,
  useDaosQuery,
  useGetAllProposalsCallback,
  useGetClientsCallback,
} from "query/getters";
import { useMemo } from "react";
import { useErrorToast } from "toasts";
import { chooseRandomVoters } from "ton-vote-contracts-sdk";
import { Dao } from "types";
import { parseLanguage } from "utils";
import { VotersSelectForm } from "./form";

export const useAirdropVotersQuery = () => {
  const getVotes = useGetAirdropVotes();
  const { proposals } = useVotersSelectStore();

  const _proposals = proposals || [];

  return useQuery(["useAirdropVotersQuery", ..._proposals], async () => {
    const votes = await getVotes();

    return _.keys(votes);
  });
};

export const useGetAirdropVotes = () => {
  const getProposals = useGetAllProposalsCallback();
  const { proposals } = useVotersSelectStore();

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
  const context = useVotersSelectStore();
  const store = useAirdropPersistStore();
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

export const useFilteredDaos = (filterValue: string) => {
  const { data: allDaos, dataUpdatedAt } = useDaosQuery();
  return useMemo(() => {
    let result = allDaos;
    if (filterValue) {
      result = _.filter(allDaos, (dao) => {
        const name = parseLanguage(
          dao.daoMetadata.metadataArgs.name
        ).toLowerCase();
        return (
          name.includes(filterValue.toLowerCase()) ||
          dao.daoAddress.includes(filterValue)
        );
      }) as Dao[];
    }
    return _.map(result, (it) => it.daoAddress);
  }, [dataUpdatedAt, filterValue]);
};

export const useDisabledDaos = () => {
  const { data: allDaos, dataUpdatedAt } = useDaosQuery();

  return useMemo(() => {
    return _.map(
      _.filter(allDaos, (it) => it.daoProposals.length === 0),
      (it) => it.daoAddress
    );
  }, [dataUpdatedAt]);
};
