import { useMutation } from "@tanstack/react-query";
import {
  useAppParams,
  useIsOneWalletOneVote,
  useProposalStatus,
} from "hooks/hooks";
import _ from "lodash";
import { Logger } from "utils";
import { useEnpointsStore } from "../store";
import { getClientV2, getClientV4 } from "ton-vote-contracts-sdk";
import {
  Endpoints,
  Proposal,
  ProposalResults,
  ProposalStatus,
  Vote,
} from "types";
import { contract } from "contract";
import { ProposalPageTranslations, useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { usePromiseToast } from "toasts";
import { useConnectedWalletVotingPowerQuery, useProposalQuery } from "query/getters";
import { useVotePersistedStore } from "store";
import { useTonAddress } from "@tonconnect/ui-react";
import { useMemo } from "react";
import moment from "moment";
import { TFunction } from "i18next";

const handleNulls = (result?: ProposalResults) => {
  const getValue = (value: any) => {
    if (_.isNull(value) || _.isNaN(value)) return 0;
    if (_.isString(value)) return Number(value);
    return value;
  };

  if (!result) return;
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
  const votePersistStore = useVotePersistedStore();
  const promiseToast = usePromiseToast();

  return useMutation(
    async (customEndpoints: Endpoints) => {
      setEndpoints(customEndpoints);
      const promiseFn = async () => {
        const clientV2 = await getClientV2(
          endpoints?.clientV2Endpoint,
          endpoints?.apiKey
        );
        const clientV4 = await getClientV4(endpoints?.clientV4Endpoint);

        // if user voted, we need to get transactions after his vote
        const maxLtAfterVote =
          votePersistStore.getValues(proposalAddress).maxLtAfterVote;

        const maxLt = maxLtAfterVote || data?.maxLt || "";

        const contractState = await contract.getProposal({
          clientV2,
          clientV4,
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
      onError: (error: Error) => console.log(error.message),
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

export type UseVoteConfirmationProps = {
  proposal: Proposal | null | undefined
  noVotingPower: boolean
  votingDataLoading: boolean
  refetch: () => void
  translations: ProposalPageTranslations
  votingData: {
    votingPower: string;
    votingPowerText: string;
} | undefined
}

export function useVoteConfirmation() {
  const translations = useProposalPageTranslations();

  const { proposalAddress } = useAppParams();
  const { data: proposal } = useProposalQuery(proposalAddress);

  const {
    data: votingData,
    isLoading: votingDataLoading,
    refetch,
  } = useConnectedWalletVotingPowerQuery(proposal, proposalAddress);

  const votingPower = votingData?.votingPower;
  
  const noVotingPower = !votingPower
    ? true
    : votingPower && Number(votingPower) === 0
    ? true
    : false;

  return {
    proposal,
    noVotingPower,
    votingDataLoading,
    refetch,
    translations,
    votingData
  }
}
