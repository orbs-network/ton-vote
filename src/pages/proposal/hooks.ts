import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useProposalAddress, useGetSender } from "hooks";
import _ from "lodash";
import { useTxReminderPopup } from "store";
import { Logger } from "utils";
import { useProposalPageQuery } from "./query";
import { useEnpointsStore, useProposalPersistedStore } from "./store";
import * as TonVoteSDK from "ton-vote-contracts-sdk";
import {
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
  getTransactions,
  ProposalResult,
} from "ton-vote-contracts-sdk";
import { TX_FEE } from "config";
import { showPromiseToast } from "toasts";
import { Endpoints, ProposalResults } from "types";
import { useProposalStatusQuery } from "query/queries";
import { lib } from "lib/lib";
import { Transaction } from "ton-core";
import { api } from "api";

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

  return useMutation(async (customEndpoints: Endpoints) => {
    analytics.GA.verifyButtonClick();
    setEndpoints(customEndpoints);
    const promiseFn = async () => {
      const clientV2 = await getClientV2(
        endpoints?.clientV2Endpoint,
        endpoints?.apiKey
      );
      const clientV4 = await getClientV4(endpoints?.clientV4Endpoint);

      let transactions: Transaction[] = [];

      const maxLt = await api.getMaxLt(proposalAddress);

      const result = await getTransactions(clientV2, proposalAddress);

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

    showPromiseToast({
      promise,
      success: "Results verified",
      loading: "Verifying results",
      error: "Failed to verify results",
    });
    return promise;
  });
};

export const useVote = () => {
  const getSender = useGetSender();
  const { refetch } = useProposalPageQuery(true);
  const { setLatestMaxLtAfterTx } = useProposalPersistedStore();
  const proposalAddress = useProposalAddress();
  const toggleTxReminder = useTxReminderPopup().setOpen;
  return useMutation(
    async (vote: string) => {
      const sender = getSender();
      toggleTxReminder(true);
      const client = await getClientV2();

      const voteFn = async () => {
        await TonVoteSDK.proposalSendMessage(
          sender,
          client,
          proposalAddress,
          TX_FEE,
          vote
        );
        return refetch();
      };

      const promise = voteFn();

      showPromiseToast({
        promise,
        success: "Vote sent",
      });

      const { data } = await promise;
      setLatestMaxLtAfterTx(proposalAddress, data?.maxLt);
    },
    {
      onSettled: () => toggleTxReminder(false),
      onSuccess: () => {},
    }
  );
};

export const useProposalPageStatus = () => {
  const { data } = useProposalPageQuery();
  const proposalAddress = useProposalAddress();
  return useProposalStatusQuery(data?.metadata, proposalAddress);
};
