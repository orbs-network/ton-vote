import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useProposalAddress, useGetSender } from "hooks";
import _ from "lodash";
import { useEnpointsStore, useTxReminderPopup } from "store";
import { Logger } from "utils";
import { useProposalPageQuery } from "./query";
import { useProposalPersistedStore } from "./store";
import * as TonVoteSDK from "ton-vote-sdk";
import { getClientV2 } from "ton-vote-sdk";
import { TX_FEE } from "config";
import { getProposalFromContract } from "lib";
import { showPromiseToast } from "toasts";
export const useIsCustomEndpoint = () => {
  const { clientV2Endpoint, clientV4Endpoint } = useEnpointsStore();

  return !!clientV2Endpoint && !!clientV4Endpoint;
};

export const useVerifyProposalResults = () => {
  const proposalAddress = useProposalAddress();
  const { data } = useProposalState();
  const currentResults = data?.proposalResult;
  const maxLt = data?.maxLt;

  return useMutation(async () => {
    analytics.GA.verifyButtonClick();

    const contractState = await getProposalFromContract(
      proposalAddress,
      undefined,
      maxLt
    );

    const compareToResults = contractState?.proposalResult;

    Logger({
      currentResults,
      compareToResults,
    });

    return _.isEqual(currentResults, compareToResults);
  });
};

export const useProposalState = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  return useProposalPageQuery(isCustomEndpoint);
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
