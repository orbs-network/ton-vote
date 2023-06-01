import { useMutation, useQuery } from "@tanstack/react-query";
import { useProposalAddress, useProposalStatus } from "hooks";
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
import {
  useGetClients,
  useGetContractState,
  useProposalQuery,
} from "query/getters";
import { QueryKeys } from "config";
import { api } from "api";
import { useProposalPersistedStore, useVoteStore } from "store";
import { proposals } from "data/foundation/data";
import { useTonAddress } from "@tonconnect/ui-react";
import { useEffect, useMemo } from "react";

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
  const proposalAddress = useProposalAddress();
  const { data } = useProposalPageQuery(false);
  const { setEndpoints, endpoints } = useEnpointsStore();
  const translations = useProposalPageTranslations();

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

        transactions = filterTxByTimestamp(result.allTxns, data?.maxLt || "");

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
      onError: (error: Error) => errorToast(error.message),
    }
  );
};

export const useProposalPageStatus = () => {
  const { data } = useProposalPageQuery();
  const proposalAddress = useProposalAddress();
  return useProposalStatus(proposalAddress, data?.metadata);
};

export const useProposalPageQuery = (isCustomEndpoint: boolean = false) => {
  const proposalAddress = useProposalAddress();
  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const clients = useGetClients().data;
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistedStore();
  const getContractStateCallback = useGetContractState();
  const { isVoting } = useVoteStore();

  return useQuery(
    [QueryKeys.PROPOSAL, proposalAddress],
    async ({ signal }) => {
      const isMockProposal = mock.getMockProposal(proposalAddress!);
      if (isMockProposal) {
        return isMockProposal;
      }
      const foundationProposal = proposals[proposalAddress!];
      if (foundationProposal) {
        return foundationProposal;
      }

      if (!isWhitelisted) {
        throw new Error("Proposal not whitelisted");
      }
      const latestMaxLtAfterTx = !isCustomEndpoint
        ? getLatestMaxLtAfterTx(proposalAddress!)
        : undefined;

      const contractState = () =>
        getContractStateCallback(proposalAddress, latestMaxLtAfterTx);

      if (true) {
        Logger("custom endpoint selected");
        return contractState();
      }

      if (latestMaxLtAfterTx) {
        const serverMaxLt = await api.getMaxLt(proposalAddress!, signal);

        if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
          Logger(
            `server maxLt is outdated, fetching from contract, maxLt: ${latestMaxLtAfterTx}, serverMaxLt: ${serverMaxLt}`
          );
          return contractState();
        }
      }
      setLatestMaxLtAfterTx(proposalAddress!, undefined);
      const proposal = await api.getProposal(proposalAddress!, signal);
      if (_.isEmpty(proposal.metadata)) {
        Logger(
          "proposal page, Proposal not found in server, fetching from contract"
        );

        return contractState();
      }
      Logger(`proposal page, fetching proposal from api ${proposalAddress}`);
      return proposal;
    },
    {
      enabled:
        !!proposalAddress &&
        !!clients?.clientV2 &&
        !!clients.clientV4 &&
        !isVoting,
      staleTime: 10_000,
      retry: isWhitelisted ? 3 : false,
      refetchInterval: isWhitelisted ? 30_000 : undefined,
    }
  );
};

export const useWalletVote = (votes?: Vote[], dataUpdatedAt?: number) => {
  const walletAddress = useTonAddress();
  return useMemo(() => {
    return _.find(votes, (it) => it.address === walletAddress);
  }, [dataUpdatedAt]);
};
