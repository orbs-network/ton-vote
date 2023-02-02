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
import {
  useAddNewVotes,
  useClients,
  useConnection,
  useSetEndpointPopup,
  useTransactionsMaxLt,
  useWalletAddress,
} from "store";
import { Address, Cell, CommentMessage, fromNano, toNano } from "ton";
import {
  Data,
  GetTransactionsPayload,
  Provider,
  QueryKeys,
  Results,
  Transaction,
  Vote,
  VotingPower,
} from "types";
import {
  getAdapterName,
  sortVotesByConnectedWallet,
  waitForSeqno,
} from "utils";
import { votingContract } from "./contracts-api/main";

export const useGetTransactionsQuery = () => {
  const { clientV2, clientV4 } = useClients();
  const { toggleError } = useSetEndpointPopup();
  const { refetch } = useDataQuery();
  const { addToList } = useTransactionsList();
  const { maxLt, setMaxLt } = useTransactionsMaxLt();

  return useQuery(
    [QueryKeys.GET_TRANSACTIONS, maxLt],
    async () => {
      const result: GetTransactionsPayload = await getTransactions(
        clientV2,
        maxLt
      );

      return {
        transactions: result.allTxns,
        maxLt: result.maxLt,
      };
    },
    {
      staleTime: Infinity,
      enabled: !!clientV2 && !!clientV4,
      refetchInterval: TRANSACTIONS_DATA_REFECTH_INTERVAL,
      onError: () => {
        toggleError(true);
      },
      onSuccess: (data) => {
        setMaxLt(data.maxLt);
        if (data.transactions.length === 0) return;
        addToList(data.transactions);

        refetch();
      },
    }
  );
};

const useTransactionsList = () => {
  const queryClient = useQueryClient();
  const getList = (): Transaction[] => {
    return queryClient.getQueryData([QueryKeys.TRANSACTIONS]) || [];
  };
  const addToList = (transactions: Transaction[]) => {
    const list = getList();
    const newList = [...transactions, ...list];
    queryClient.setQueryData([QueryKeys.TRANSACTIONS], newList);
    return newList;
  };

  const clearList = () => {
    queryClient.setQueryData([QueryKeys.TRANSACTIONS], []);
  };
  return {
    getList,
    addToList,
    clearList,
  };
};

export const useDataQuery = () => {
  const queryClient = useQueryClient();
  const { clientV2, clientV4 } = useClients();
  const walletAddress = useWalletAddress();
  const { toggleError } = useSetEndpointPopup();
  const { getList } = useTransactionsList();
  const { getData } = useData();

  const addNewVotes = useAddNewVotes();

  return useQuery(
    [QueryKeys.DATA],
    async () => {
      const transactions = getList();

      if (!transactions.length) {
        return {
          votingPower: undefined,
          currentResults: undefined,
          votes: undefined,
        };
      }

      console.log({ transactions });

      const proposalInfo = await queryClient.ensureQueryData({
        queryKey: [QueryKeys.PROPOSAL_INFO],
        queryFn: () => getProposalInfo(clientV2, clientV4),
      });

      const votingPower: VotingPower = await getVotingPower(
        clientV4,
        proposalInfo,
        transactions,
        getData()?.votingPower
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
            votingPower: _votingPower ? fromNano(_votingPower) : "0",
          };
        }
      );

      const prevVotesLength = getData()?.votes?.length || 0;
      const newVotesLength = votes.length;
      // addNewVotes(newVotesLength - prevVotesLength);

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
      enabled: !!clientV2 && !!clientV4,
    }
  );
};

const useData = () => {
  const queryClient = useQueryClient();
  const getData = (): Data | undefined => {
    return queryClient.getQueryData([QueryKeys.DATA]);
  };
  const setData = (data: Data) => {
    queryClient.setQueryData([QueryKeys.DATA], data);
  };

  return {
    getData,
    setData,
  };
};

export const useSortVotesAfterConnect = () => {
  const { getData, setData } = useData();
  return (walletAddress: string) => {
    const data = getData();
    const votes = getData()?.votes || [];
    const newData = {
      ...data,
      votes: sortVotesByConnectedWallet(votes, walletAddress),
    };
    setData(newData);
  };
};

export const useProposalInfoQuery = () => {
  const { clientV2, clientV4 } = useClients();
  return useQuery(
    [QueryKeys.PROPOSAL_INFO],
    () => getProposalInfo(clientV2, clientV4),
    {
      enabled: !!clientV2 && !!clientV4,
      staleTime: Infinity,
    }
  );
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
