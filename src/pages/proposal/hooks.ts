import { useMutation } from "@tanstack/react-query";
import { useAppParams, useIsOneWalletOneVote } from "hooks/hooks";
import _ from "lodash";
import { isSameAddress, Logger } from "utils";
import { useEnpointsStore } from "./store";
import { Endpoints, Proposal, ProposalResults, Vote } from "types";
import { contract } from "contract";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { usePromiseToast } from "toasts";
import { useProposalQuery } from "query/getters";
import { useVotePersistedStore } from "store";
import { useTonAddress } from "@tonconnect/ui-react";
import { useMemo } from "react";
import moment from "moment";
import { TFunction } from "i18next";
import {
  getClientV2FallbackEndpoints,
  getClientV4FallbackEndpoints,
} from "rpc";
import { calcProposalResult } from "ton-vote-contracts-sdk";
import { shouldVerifyWithCachedVotingPower } from "data/proposals-metadata";

const handleNulls = (_result?: ProposalResults) => {
  const getValue = (value: any) => {
    if (_.isNull(value) || _.isNaN(value)) return 0;
    if (_.isString(value)) return Number(value);
    return value;
  };

  if (!_result) return;

  const { totalWeights, totalWeight, ...result } = _result;
  _.forEach(result, (value, key) => {
    result[key] = getValue(value);
  });

  return result;
};

const getResultWithCachedVotingPower = (
  proposal?: Proposal | null,
  votingPower?: Proposal["votingPower"]
) => {
  if (!proposal?.metadata || !proposal?.rawVotes || _.isEmpty(votingPower)) {
    return;
  }

  return calcProposalResult(
    proposal.rawVotes,
    votingPower,
    proposal.metadata.votingSystem
  ) as ProposalResults;
};

export const useVerifyProposalResults = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const { setEndpoints, endpoints } = useEnpointsStore();
  const translations = useProposalPageTranslations();
  const votePersistStore = useVotePersistedStore();
  const promiseToast = usePromiseToast();

  return useMutation(
    async (customEndpoints: Endpoints) => {
      setEndpoints(customEndpoints);
      const _endpoints = customEndpoints || endpoints;
      const promiseFn = async () => {
        // if user voted, we need to get transactions after his vote
        const maxLtAfterVote =
          votePersistStore.getValues(proposalAddress).maxLtAfterVote;

        const maxLt = maxLtAfterVote || data?.maxLt || "";

        const contractState = await contract.getProposal({
          clientV2Endpoints: getClientV2FallbackEndpoints(
            _endpoints?.clientV2Endpoint,
            _endpoints?.apiKey
          ),
          clientV4Endpoints: getClientV4FallbackEndpoints(
            _endpoints?.clientV4Endpoint
          ),
          proposalAddress,
          metadata: data?.metadata,
          maxLt,
        });
        const currentResults = handleNulls(data?.proposalResult);
        const compareToResults = handleNulls(contractState?.proposalResult);

        Logger({
          currentResults,
          compareToResults,
        });

        const isEqual = _.isEqual(currentResults, compareToResults);

        if (!isEqual) {
          const cachedVotingPowerResults =
            shouldVerifyWithCachedVotingPower(proposalAddress)
              ? handleNulls(
                  getResultWithCachedVotingPower(contractState, data?.votingPower)
                )
              : undefined;
          const isEqualWithCachedVotingPower = _.isEqual(
            currentResults,
            cachedVotingPowerResults
          );

          Logger({
            cachedVotingPowerResults,
            isEqualWithCachedVotingPower,
          });

          if (!isEqualWithCachedVotingPower) {
            throw new Error("Not equal");
          }
        }
        return true;
      };

      const promise = promiseFn();

      promiseToast({
        promise,
        success: translations.resultsVerified,
        loading: translations.verifyingResults,
        error: translations.failedToVerifyResults,
      });

      if (_.isEmpty(data?.proposalResult)) {
        return true;
      }
      return promise;
    },
    {
      onError: (error: Error) => console.log(error.message),
    }
  );
};

export const useWalletVote = (votes?: Vote[], dataUpdatedAt?: number) => {
  const walletAddress = useTonAddress();
  return useMemo(() => {
    return _.find(votes, (it) => isSameAddress(it.address, walletAddress));
  }, [dataUpdatedAt, walletAddress]);
};

const getCsvConfig = (isOneWalletOneVote: boolean) => {
  let titles = [];
  let keys = [];
  if (isOneWalletOneVote) {
    titles = ["address", "vote", "date"];
    keys = ["address", "vote"];
  } else {
    titles = ["address", "vote", "votingPower", "date"];
    keys = ["address", "vote", "votingPower"];
  }

  return {
    titles,
    keys,
  };
};

export const useCsvData = () => {
  const translations = useProposalPageTranslations();
  const { proposalAddress } = useAppParams();
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);

  return useMemo(() => {
    const config = getCsvConfig(isOneWalletOneVote);
    const values = _.map(data?.votes, (vote) => {
      const value = config.keys.map((key) => {
        return vote[key as keyof Vote];
      });

      return [
        ...value,
        moment.unix(vote.timestamp).format("DD/MM/YY HH:mm:ss"),
      ];
    });

    values.unshift(
      config.titles.map((it) => translations[it as keyof TFunction])
    );
    return values;
  }, [dataUpdatedAt]);
};
