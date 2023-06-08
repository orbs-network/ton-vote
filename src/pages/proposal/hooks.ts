import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppParams, useProposalStatus } from "hooks";
import _ from "lodash";
import { isProposalWhitelisted, Logger } from "utils";
import { useEnpointsStore } from "./store";
import {
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
  getTransactions,
} from "ton-vote-contracts-sdk";
import { Endpoints, ProposalResults, Vote } from "types";
import { lib } from "lib/lib";
import { Transaction } from "ton-core";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { errorToast, usePromiseToast } from "toasts";
import { mock } from "mock/mock";
import { useGetClients, useProposalQuery } from "query/getters";
import { QueryKeys } from "config";
import { api } from "api";
import { useVotePersistedStore, useSyncStore, useVoteStore } from "store";
import { useTonAddress } from "@tonconnect/ui-react";
import { useEffect, useMemo } from "react";
import { FOUNDATION_PROPOSALS } from "data/foundation/data";
import { getIsServerUpToDate, useGetContractProposal } from "query/hooks";

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

        let transactions: Transaction[] = [];

        const result = await getTransactions(clientV2, proposalAddress);


        // if user voted, we need to get transactions after his vote
        const voteMaxLt =
          votePersistStore.getValues(proposalAddress).latestMaxLtAfterTx;

        const maxLt = voteMaxLt || data?.maxLt || "";

        transactions = filterTxByTimestamp(result.allTxns, maxLt);

        const contractState = await lib.getProposalFromContract(
          clientV2,
          clientV4,
          proposalAddress,
          data?.metadata,
          transactions
        );
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

export const useProposalPageStatus = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);

  return useProposalStatus(proposalAddress, data?.metadata);
};

export const useWalletVote = (votes?: Vote[], dataUpdatedAt?: number) => {
  const walletAddress = useTonAddress();
  return useMemo(() => {
    return _.find(votes, (it) => it.address === walletAddress);
  }, [dataUpdatedAt]);
};
