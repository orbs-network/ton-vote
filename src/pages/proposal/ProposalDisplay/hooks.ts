import { useMutation } from "@tanstack/react-query";
import {
  useAppParams,
  useIsOneWalletOneVote,
  useProposalStatus,
} from "hooks/hooks";
import _ from "lodash";
import { useEnpointsStore } from "../store";
import { Endpoints, ProposalStatus, Vote } from "types";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { usePromiseToast } from "toasts";
import { useProposalQuery } from "query/getters";
import { useMemo } from "react";
import moment from "moment";
import { TFunction } from "i18next";
import { analytics } from "analytics";
import { lib } from "lib";

export const useVerifyProposalResults = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const { setEndpoints, endpoints } = useEnpointsStore();
  const translations = useProposalPageTranslations();
  const promiseToast = usePromiseToast();

  return useMutation(
    async (customEndpoints: Endpoints) => {
      setEndpoints(customEndpoints);
      const _endpoints = customEndpoints || endpoints;
      const promiseFn = async () => {
        analytics.verifyResultsRequest(proposalAddress);

        const isEqual = await lib.compareProposalResults({
          proposalAddress,
          endpoints: _endpoints,
          proposal: data,
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

  const { proposalStatus } = useProposalStatus(proposalAddress);

  const votes = useMemo(() => {
    if (!proposalStatus || proposalStatus === ProposalStatus.NOT_STARTED) {
      return false;
    }
    return true;
  }, [proposalStatus]);

  const vote = useMemo(() => {
    if (
      !proposalStatus ||
      proposalStatus !== ProposalStatus.ACTIVE ||
      isLoading
    ) {
      return false;
    }
    return true;
  }, [proposalStatus, isLoading]);

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
