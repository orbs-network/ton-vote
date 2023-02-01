import {
  Updater,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
import { useTransactionsPage } from "store/data-store";
import {
  getAdapterName,
  useConnection,
  useWalletAddress,
} from "store/wallet-store";
import { Address, Cell, CommentMessage, fromNano, toNano } from "ton";
import { Data, Provider, QueryKeys, Results, Vote, VotingPower } from "types";
import { sortVotesByConnectedWallet, waitForSeqno } from "utils";
import { votingContract } from "./contracts-api/main";

export const useGetTransactions = () => {
  const { clientV2, clientV4 } = useClients();
  const { toggleError } = useSetEndpointPopup();
  const { refetch } = useDataQuery();

  const page = useTransactionsPage().page;

  return useQuery(
    [QueryKeys.TRANSACTIONS, page],
    async () => {
      const result = await getTransactions(clientV2, page);
      console.log(result);
      
      return {
        transactions: _.flatten(result.allTxns),
        nextPage: result.maxLt,
      };
    },
    {
      staleTime: Infinity,
      enabled: !!clientV2 && !!clientV4,
      onError: () => {
        toggleError(true);
      },
      onSuccess: (data) => {
        // refetch only if the returned transactions array is bigger than 0
        if (data.transactions.length > 0) {
          refetch();
        }
      },
    }
  );
};



export const useClearTransactions = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries([QueryKeys.TRANSACTIONS])
  }
}

export const useDataQuery = () => {
  const queryClient = useQueryClient();
  const { clientV2, clientV4 } = useClients();
  const walletAddress = useWalletAddress()
  const { toggleError } = useSetEndpointPopup();

  const getCurrentData = useGetDataFromQuery();

  return useQuery(
    [QueryKeys.DATA],
    async () => {
      //create one array from all the transaction pages we have in cache
      const transactionsData = queryClient.getQueriesData([QueryKeys.TRANSACTIONS]);
      const transactionsArrays = transactionsData.map(
        (it: any) => it[1].transactions
      );
      const transactions = _.flatten(transactionsArrays);

      const proposalInfo = await queryClient.ensureQueryData({
        queryKey: [QueryKeys.PROPOSAL_INFO],
        queryFn: () => getProposalInfo(clientV2),
      });

      const votingPower: VotingPower = await getVotingPower(
        clientV4,
        proposalInfo,
        transactions,
        getCurrentData()?.votingPower
      );

      const currentResults: Results = getCurrentResults(
        transactions,
        votingPower,
        proposalInfo
      );

      const votes: Vote[] = _.map(
        getAllVotes(transactions, proposalInfo) || {},
        (v, key) => {
          const _votingPower = votingPower[key];
          return {
            address: key,
            vote: v,
            votingPower: _votingPower ? fromNano(_votingPower) : '0',
          };
        }
      );    
            
      return {
        votingPower,
        currentResults,
        votes: sortVotesByConnectedWallet(votes, walletAddress),
      };
    },
    {
      onError: () => {
        toggleError(true);
      },
      staleTime: Infinity,
      refetchInterval: TRANSACTIONS_DATA_REFECTH_INTERVAL,
      enabled: !!clientV2 && !!clientV4,
    }
  );
};

const useGetDataFromQuery = (): (() => Data | undefined) => {
  const queryClient = useQueryClient();
  return () => queryClient.getQueryData([QueryKeys.DATA]);
};

export const useSortVotesAfterConnect = () => {
  const getData = useGetDataFromQuery();
  const queryClient = useQueryClient();
  return (walletAddress: string) => {
    const votes = getData()?.votes || [];
    queryClient.setQueryData(
      [QueryKeys.DATA],
      (data: Updater<Data | undefined, Data | undefined>) => {
        return {
          ...data,
          votes: sortVotesByConnectedWallet(votes, walletAddress),
        };
      }
    );
  };
};

export const useNextPage = () => {
  const { setPage, page } = useTransactionsPage();
  const { data, isLoading } = useGetTransactions();


  return {
    loadMore: () => setPage(data?.nextPage),
    isLoading: data?.nextPage !== page && isLoading ? true : false,
    hide:  !isLoading && !data?.transactions.length,
  };
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
      const isExtension = getAdapterName() === Provider.EXTENSION;
      
      if (isMobile || isExtension) {
        await connection?.requestTransaction({
          to: votingContract,
          value: toNano(TX_FEE),
          message: cell,
        });
        await onSuccess();
      } else {
        await connection?.requestTransaction(
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
