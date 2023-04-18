import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useProposalAddress, useGetSender } from "hooks";
import _ from "lodash";
import { useTxReminderPopup } from "store";
import { Logger } from "utils";
import { useProposalPageQuery } from "./query";
import { useEnpointsStore, useProposalPersistedStore } from "./store";
import * as TonVoteSDK from "ton-vote-sdk";
import { getClientV2 } from "ton-vote-sdk";
import { TX_FEE } from "config";
import { getProposalFromContract } from "lib";
import { showPromiseToast } from "toasts";
import { Endpoints } from "types";

export const useVerifyProposalResults = () => {
  const proposalAddress = useProposalAddress();
  const { data } = useProposalState();
  const currentResults = data?.proposalResult;
  const maxLt = data?.maxLt;
  const { setEndpoints } = useEnpointsStore();

  return useMutation(async (customEndpoints: Endpoints) => {
    analytics.GA.verifyButtonClick();
    setEndpoints(customEndpoints);
    const promiseFn = async () => {
      const contractState = await getProposalFromContract(
        proposalAddress,
        undefined,
        maxLt,
        customEndpoints
      );
      const compareToResults = contractState?.proposalResult;

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

export const useProposalState = () => {
  return useProposalPageQuery(false);
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
