import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { TX_FEE } from "config";
import {
  getAllVotes,
  getClientV2,
  getClientV4,
  getCurrentResults,
  getProposalInfo,
  getTransactions,
  getVotingPower,
} from "contracts-api/main";
import _ from "lodash";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useClient, useClient4 } from "store/client-store";
import { useConnection, useSelectedProvider, useWalletAddress } from "store/wallet-store";
import { Address, beginCell, Cell, CommentMessage, toNano } from "ton";
import { Provider } from "types";
import { waitForSeqno } from "utils";
import { votingContract } from "./contracts-api/main";

enum QueryKeys {
  TRANSACTIONS = "TRANSACTIONS",
  VOTING_POWER = "VOTING_POWER",
  PROPOSAL_INFO = "PROPOSAL_INFO",
  CURRENT_RESULTS = "CURRENT_RESULTS",
  GET_ALL_VOTES = "GET_ALL_VOTES",
}

export const useTransactionsQuery = () => {
  const { client } = useClient();
  const { client4 } = useClient4();
  const queryClient = useQueryClient();

  return useQuery(
    [QueryKeys.TRANSACTIONS],
    async ({ pageParam = undefined }) => {
      const result = await getTransactions(client, pageParam);

      if (result.allTxns.length) {
        const onlyTxs = result.allTxns;
        const transactions = _.flatten(onlyTxs);
        const proposalInfo = await queryClient.ensureQueryData({
          queryKey: [QueryKeys.PROPOSAL_INFO],
          queryFn: () => getProposalInfo(client),
        });

        const prevVotingPower = queryClient.getQueryData([
          QueryKeys.VOTING_POWER,
        ]);

        const votingPower = await getVotingPower(
          client4,
          proposalInfo,
          transactions,
          prevVotingPower as any
        );

        const currentResults = getCurrentResults(
          transactions,
          votingPower,
          proposalInfo
        );

        const allVotes = getAllVotes(transactions, proposalInfo);

        const allVotesArr = _.map(allVotes || {}, (v, key) => {
          return {
            address: key,
            vote: v,
          };
        });

        queryClient.setQueryData([QueryKeys.GET_ALL_VOTES], allVotesArr);
        queryClient.setQueryData([QueryKeys.CURRENT_RESULTS], currentResults);
        queryClient.setQueryData([QueryKeys.VOTING_POWER], votingPower);
      }
      return result;
    },
    {
      staleTime: Infinity,
      refetchInterval: 30_000,
      onError: console.error,
    }
  );
};

export const useClientV2Query = () => {
  const { setClient } = useClient();
  useQuery(["useClientV2Query"], async () => {
    setClient(await getClientV2());
    return "";
  });
};

export const useClientV4Query = () => {
  const { setClient4 } = useClient4();

  useQuery(["useClientV4Query"], async () => {
    setClient4(await getClientV4());
    return "";
  });
};

export const useVotingPowerQuery = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData([QueryKeys.VOTING_POWER]);
};

export const useProposalInfoQuery = () => {
  const { client } = useClient();
  return useQuery(["useProposalInfoQuery"], () => getProposalInfo(client), {
    enabled: !!client,
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};

export const useCurrentResultsQuery = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData([QueryKeys.CURRENT_RESULTS]) as
    | ReturnType<typeof getCurrentResults>
    | undefined;
};

export const useAllVotesQuery = () => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData([QueryKeys.GET_ALL_VOTES]) as
    | any[]
    | undefined;
};

export const useSendTransaction = () => {
  const connection = useConnection();
  const address = useWalletAddress();
  const { refetch } = useTransactionsQuery();
  const { client } = useClient();
  const [txApproved, setTxApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const selectedProvider = useSelectedProvider()

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
        client!.openWalletFromAddress({
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
    }
  );

  return {
    ...query,
    txApproved,
    isLoading,
  };
};
