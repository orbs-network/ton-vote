import { useMutation } from "@tanstack/react-query";
import { useNotification } from "components";
import { TX_SUBMIT_ERROR_TEXT, TX_SUBMIT_SUCCESS_TEXT } from "config";
import { useConnectionStore } from "connection";
import { getClientV2 } from "contracts-api/logic";
import { contract } from "data-service";

import { useState } from "react";
import { Logger } from "utils";

interface SendTxArgs {
  analytics?: {
    submitted?: () => void;
    success?: () => void;
    error?: (error: string) => void;
  };

  onFinished: () => void;
  message: string;
  contractAddress: string;
}

export const useSendTransaction = () => {
  const walletAddress = useConnectionStore((store) => store.address);
  const [txApproved, setTxApproved] = useState(false);
  const { showNotification } = useNotification();
  const [txLoading, setTxLoading] = useState(false);

  const query = useMutation(
    async (args: SendTxArgs) => {
      args.analytics?.submitted?.();

      setTxLoading(true);
      const clientV2 = await getClientV2();
      //   const waiter = await waitForSeqno(clientV2!.open(contractAddress(args.contractAddress)));

      const onSuccess = async () => {
        setTxApproved(true);
        // await waiter();
        args.onFinished();
        setTxApproved(false);
        setTxLoading(false);
        args.analytics?.success?.();

        showNotification({
          variant: "success",
          message: TX_SUBMIT_SUCCESS_TEXT,
        });
      };

      return contract.sendTransaction(
        args.contractAddress,
        args.message,
        onSuccess
      );
    },
    {
      onError: (error: any, args) => {
        if (error instanceof Error) {
          args.analytics?.error?.(error.message);
          Logger(error.message);
        }

        setTxLoading(false);
        setTxApproved(false);
        showNotification({ variant: "error", message: TX_SUBMIT_ERROR_TEXT });
      },
    }
  );

  return {
    ...query,
    txApproved,
    isLoading: txLoading,
  };
};
