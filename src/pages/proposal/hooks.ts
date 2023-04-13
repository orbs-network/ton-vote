import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useProposalAddress, useGetSender } from "hooks";
import { getContractState } from "lib";
import _ from "lodash";
import { useEnpointsStore, useTxReminderPopup } from "store";
import { Logger } from "utils";
import { useProposalStateQuery } from "./query";
import { useProposalPersistedStore } from "./store";

export const useIsCustomEndpoint = () => {
  const { clientV2Endpoint, clientV4Endpoint } = useEnpointsStore();

  return !!clientV2Endpoint && !!clientV4Endpoint;
};

export const useVerifyProposalResults = () => {
  const proposalAddress = useProposalAddress();
  const { data } = useProposalState();
  const currentResults = data?.results;
  const maxLt = data?.maxLt;

  return useMutation(async () => {
    analytics.GA.verifyButtonClick();

    const contractState = await getContractState(
      proposalAddress,
      undefined,
      maxLt
    );

    const compareToResults = contractState?.results;

    Logger({
      currentResults,
      compareToResults,
    });

    return _.isEqual(currentResults, compareToResults);
  });
};

export const useProposalState = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  return useProposalStateQuery(isCustomEndpoint);
};

export const useVote = () => {
  const getSender = useGetSender();
  const { refetch } = useProposalStateQuery(true);
  const { setLatestMaxLtAfterTx } = useProposalPersistedStore();
  const proposalAddress = useProposalAddress();
  const toggleTxReminder = useTxReminderPopup().setOpen;
  return useMutation(
    async () => {
      const sender = getSender();
      toggleTxReminder(true);
      const { data } = await refetch();
      console.log({ data });

      setLatestMaxLtAfterTx(proposalAddress, data?.maxLt);
    },
    {
      onSettled: () => toggleTxReminder(false),
      onSuccess: () => {},
    }
  );
};
