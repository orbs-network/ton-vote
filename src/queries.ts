import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TRANSACTIONS_DATA_REFECTH_INTERVAL,
  TX_FEE,
  voteOptions,
} from "config";
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
  useClients,
  useConnection,
  useMaxLtStore,
  useSetEndpointPopup,
  useVotesPaginationStore,
  useVoteStore,
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
import { votingContract } from "contracts-api/main";

export const useGetTransactionsQuery = () => {
  const { clientV2, clientV4 } = useClients();
  const { toggleError } = useSetEndpointPopup();
  const { refetch } = useDataQuery();
  const { addToList } = useTransactionsList();
  const { maxLt, setMaxLt } = useMaxLtStore();

  return useQuery(
    [QueryKeys.GET_TRANSACTIONS, maxLt],
    async () => {
      const result: GetTransactionsPayload = await getTransactions(
        clientV2,
        maxLt
      );
      if (result.allTxns.length > 0) {
        addToList(result.allTxns);
        refetch();
      }

      return result;
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
    list.unshift(...transactions);
    queryClient.setQueryData([QueryKeys.TRANSACTIONS], list);
    return list;
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

export const useResetQueries = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.resetQueries();
  };
};

export const useDataQuery = () => {
  const queryClient = useQueryClient();
  const { clientV2, clientV4 } = useClients();
  const walletAddress = useWalletAddress();
  const { toggleError } = useSetEndpointPopup();
  const { getList } = useTransactionsList();
  const { getData } = useData();
  const sortVotes = useSortVotes();

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
        (v: any, key) => {
          const _votingPower = votingPower[key];

          return {
            address: key,
            vote: v.vote,
            votingPower: _votingPower ? fromNano(_votingPower) : "0",
            timestamp: v.timestamp,
          };
        }
      );

      const prevVotesLength = getData()?.votes?.length || 0;
      const newVotesLength = votes.length;

      // if (maxLt) {
      //   loadMore(newVotesLength - prevVotesLength);
      // }
      return {
        votingPower,
        currentResults,
        votes: sortVotes(votes, walletAddress),
      };
    },
    {
      onError: () => {
        toggleError(true);
      },
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: false,
    }
  );
};

export const useData = () => {
  const queryClient = useQueryClient();
  const getData = (): Data | undefined => {
    return queryClient.getQueryData([QueryKeys.DATA]);
  };
  const setData = (data: Data) => {
    return queryClient.setQueryData([QueryKeys.DATA], (old: Data | undefined = {}) => {
      return {
        ...old,
        data,
      };
    });
  };

  return {
    getData,
    setData,
  };
};

export const useSortVotes = () => {
  const { vote, setVote } = useVoteStore();

  return (votes: Vote[], address?: string) => {
    if (!address) {
      return votes;
    }
    const { sortedVotes, connectedAddressVote } = sortVotesByConnectedWallet(
      votes,
      address
    );
    if (!vote && connectedAddressVote) {
      const vote = voteOptions.find(
        (it) => it.name === connectedAddressVote.vote
      );
      setVote(vote?.value);
    }

    return sortedVotes;
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
  const { clientV2 } = useClients();
  const [txApproved, setTxApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {refetch} = useGetTransactionsQuery();
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
