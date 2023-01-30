import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TRANSACTIONS_DATA_REFECTH_INTERVAL, TX_FEE } from "config";
import {
  getAllVotes,
  getCurrentResults,
  getProposalInfo,
  getTransactions,
  getVotingPower,
} from "contracts-api/main";
import _ from "lodash";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import { useClients, useSetEndpointPopup } from "store/client-store";
import {
  useConnection,
  useSelectedProvider,
  useWalletAddress,
} from "store/wallet-store";
import { Address, Cell, CommentMessage, toNano } from "ton";
import { Provider } from "types";
import { waitForSeqno } from "utils";
import { votingContract } from "./contracts-api/main";



enum QueryKeys {
  DATA = "DATA",
  PROPOSAL_INFO = "PROPOSAL_INFO",
}

export const useDataQuery = () => {
  const { clientV2, clientV4 } = useClients();
  const queryClient = useQueryClient();
  const { toggleError } = useSetEndpointPopup();

  return useQuery(
    [QueryKeys.DATA],
    async ({ pageParam = undefined }) => {
      const result = await getTransactions(clientV2, pageParam);

      const transactions = _.flatten(result.allTxns);
      const proposalInfo = await queryClient.ensureQueryData({
        queryKey: [QueryKeys.PROPOSAL_INFO],
        queryFn: () => getProposalInfo(clientV2),
      });

      const votingPower = await getVotingPower(
        clientV4,
        proposalInfo,
        transactions,
        (queryClient.getQueryData([QueryKeys.DATA]) as any)?.votingPower
      );

      const currentResults = getCurrentResults(
        transactions,
        votingPower,
        proposalInfo
      );

      const votes = _.map(
        getAllVotes(transactions, proposalInfo) || {},
        (v, key) => {
          return {
            address: key,
            vote: v,
          };
        }
      );
      return {
        votes,
        currentResults,
        votingPower,
      };
    },
    {
      refetchInterval: TRANSACTIONS_DATA_REFECTH_INTERVAL,
      enabled: !!clientV2 && !!clientV4,
      staleTime: Infinity,
      onError: () => {
        toggleError(true);
      },
    }
  );
};


export const useProposalInfoQuery = () => {
  const { clientV2 } = useClients();
  return useQuery([QueryKeys.PROPOSAL_INFO], () => getProposalInfo(clientV2), {
    enabled: !!clientV2,
    staleTime: Infinity,
  });
};

export const useSendTransaction = () => {
  const connection = useConnection();
  const address = useWalletAddress();
  const { refetch } = useDataQuery();
  const { clientV2 } = useClients();
  const [txApproved, setTxApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const selectedProvider = useSelectedProvider();

  const query = useMutation(
    async ({ value }: { value: "yes" | "no" | "abstain" }) => {
      const cell = new Cell();
      new CommentMessage(value).writeTo(cell);

      const onSuccess = async () => {
        setTxApproved(true);
        await waiter();
        await refetch();
        setTxApproved(false);
        setIsLoading(false);
      };

      setIsLoading(true);

      const waiter = await waitForSeqno(
        clientV2!.openWalletFromAddress({
          source: Address.parse(address!),
        })
      );

      if (isMobile || selectedProvider?.type === Provider.EXTENSION) {
        await connection.requestTransaction({
          to: votingContract,
          value: toNano(TX_FEE),
          message: cell,
        });
        await onSuccess();
      } else {
        await connection.requestTransaction(
          {
            to: votingContract,
            value: toNano(TX_FEE),
            message: cell,
          },
          onSuccess
        );
      }
    },
    {
      onError: () => {
        setIsLoading(false);
        setTxApproved(false);
      },
    }
  );

  return {
    ...query,
    txApproved,
    isLoading,
  };
};
