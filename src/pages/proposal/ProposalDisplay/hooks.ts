import { useMutation } from "@tanstack/react-query";
import { useAppParams, useIsOneWalletOneVote, useIsValidatorsProposal, useProposalStatus } from "hooks/hooks";
import _, { isEqual } from "lodash";
import { Logger } from "utils";

import { getClientV2, getClientV4 } from "ton-vote-contracts-sdk";
import { Endpoints, Proposal, ProposalResults, ProposalStatus, Vote } from "types";
import { contract } from "contract";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { showSuccessToast, usePromiseToast } from "toasts";
import { useProposalQuery, useWalletVotingPowerQuery } from "query/getters";
import { useVotePersistedStore } from "store";
import { useTonAddress } from "@tonconnect/ui-react";
import { useEffect, useMemo } from "react";
import moment from "moment";
import { TFunction } from "i18next";
import { useEnpointsStore } from "../store";
import { analytics } from "analytics";

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

export const useVerifyProposalResults = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const { setEndpoints, endpoints } = useEnpointsStore();
  const translations = useProposalPageTranslations();
  const promiseToast = usePromiseToast();
  const votePersistStore = useVotePersistedStore();

  return useMutation(
    async (customEndpoints: Endpoints) => {
      setEndpoints(customEndpoints);
      const _endpoints = customEndpoints || endpoints;
      const promiseFn = async () => {
        analytics.verifyResultsRequest(proposalAddress);

        // if user voted, we need to get transactions after his vote
        const maxLtAfterVote =
          votePersistStore.getValues(proposalAddress).maxLtAfterVote;

        const maxLt = maxLtAfterVote || data?.maxLt || "";

        const clientV2 = await getClientV2(_endpoints.clientV2Endpoint);
        const clientV4 = await getClientV4(_endpoints.clientV4Endpoint);

        const contractState = await contract.getProposal({
          clientV2,
          clientV4,
          proposalAddress,
        });

        if (!isEqual) {
          throw new Error("Not equal");
        }
        return isEqual;
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
      onError: (error: Error) => {
        analytics.verifyResultsError(error.message);
      },
      onSuccess: () => {
        analytics.verifyResultsSuccess();
      },
    }
  );
};

export const useWalletVote = (votes?: Vote[], dataUpdatedAt?: number) => {
  const walletAddress = useTonAddress();
  return useMemo(() => {
    return _.find(votes, (it) => it.address === walletAddress);
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

export const useCsvData = (votes: Vote[], dataUpdatedAt: number) => {
  const translations = useProposalPageTranslations();
  const { proposalAddress } = useAppParams();

  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);

  return useMemo(() => {
    const config = getCsvConfig(isOneWalletOneVote);
    const values = _.map(votes, (vote) => {
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

export const useShowComponents = () => {
  const { proposalAddress } = useAppParams();
  const isLoading = useProposalQuery(proposalAddress).isLoading;
  const isValidatorsProposal = useIsValidatorsProposal(proposalAddress);

  const { proposalStatus } = useProposalStatus(proposalAddress);

  const votes = useMemo(() => {
    if (!proposalStatus || proposalStatus === ProposalStatus.NOT_STARTED) {
      return false;
    }
    return true;
  }, [proposalStatus]);

  const vote = useMemo(() => {
    if (
      isValidatorsProposal || 
      !proposalStatus ||
      proposalStatus !== ProposalStatus.ACTIVE ||
      isLoading
    ) {
      return false;
    }
    return true;
  }, [proposalStatus, isLoading, isValidatorsProposal]);

  const deadline = useMemo(() => {
    if (!proposalStatus || proposalStatus === ProposalStatus.CLOSED) {
      return false;
    }
    return true;
  }, [proposalStatus]);

  const results = useMemo(() => {
    if (!proposalStatus || proposalStatus === ProposalStatus.NOT_STARTED) {
      return false;
    }
    return true;
  }, [proposalStatus]);

  return {
    votes,
    vote,
    deadline,
    results,
  };
};

export const useConnectedWalletVotingPower = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  return useWalletVotingPowerQuery(data, proposalAddress);
};
