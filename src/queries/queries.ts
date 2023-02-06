import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "api";
import {
  LAST_FETCH_UPDATE_LIMIT,
  STATE_REFETCH_INTERVAL,
  TX_FEE,
  votingContract,
} from "config";
import {
  getAllVotes,
  getCurrentResults,
  getProposalInfo,
  getTransactions,
  getVotingPower,
} from "contracts-api/logic";
import { useAddWalletVoteManually, useLocalStorageWalletVote } from "hooks";
import _ from "lodash";
import moment from "moment";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import {
  useClient,
  useSetEndpointPopup,
  useMaxLtStore,
  useDataUpdaterStore,
  usePersistedStore,
  useWalletAddress,
  useConnection,
} from "store";
import { Address, Cell, CommentMessage, fromNano, toNano } from "ton";
import {
  QueryKeys,
  GetTransactionsPayload,
  Results,
  Vote,
  VotingPower,
  Transaction,
  RawVotes,
  RawVote,
  GetState,
  ProposalInfo,
  Provider,
} from "types";
import { getAdapterName, unshiftWalletVote, waitForSeqno } from "utils";

export const useStateQuery = () => {
  const queryClient = useQueryClient();
  const { clientV2, clientV4 } = useClient();
  const { toggleError } = useSetEndpointPopup();
  const { getList } = useTransactionsList();
  const { getData } = useStateData();
  const { serverDisabled } = usePersistedStore();
  const { data: contractAddress } = useContractAddressQuery();
  const walletAddress = useWalletAddress();

  const handleWalletVote = useHandleWalletVote();

  return useQuery(
    [QueryKeys.STATE],
    async (): Promise<GetState | undefined> => {
      let rawVotes: RawVotes = {};
      let proposalResults: Results | undefined = undefined;
      let votingPower: VotingPower = {};

      const getProposalInfoQueryFn = (): Promise<ProposalInfo> => {
        if (serverDisabled) {
          return getProposalInfo(clientV2, clientV4, contractAddress);
        }
        return api.getProposalInfo();
      };

      const proposalInfo = await queryClient.ensureQueryData({
        queryKey: [QueryKeys.PROPOSAL_INFO],
        queryFn: getProposalInfoQueryFn,
      });

      // get from server
      if (!serverDisabled) {
        console.log("fetching from server");

        const state = await api.getState();
        console.log(state.votes);

        rawVotes = state.votes;
        proposalResults = state.proposalResults;
        votingPower = state.votingPower;
      }
      // get from contract
      else {
        console.log("fetching from contract");
        const transactions = getList();

        votingPower = await getVotingPower(
          clientV4,
          proposalInfo,
          transactions,
          getData()?.votingPower
        );

        rawVotes = getAllVotes(transactions, proposalInfo) as RawVotes;

        proposalResults = getCurrentResults(
          transactions,
          votingPower,
          proposalInfo
        );
      }
      let votes: Vote[] = _.map(rawVotes, (v: RawVote, key: string) => {
        const _votingPower = votingPower[key];
        return {
          address: key,
          vote: v.vote,
          votingPower: _votingPower ? fromNano(_votingPower) : "0",
          timestamp: v.timestamp,
        };
      });

      votes = _.orderBy(votes, "timestamp", ["desc", "asc"]);

      return {
        votes: handleWalletVote(votes),
        proposalResults: proposalResults,
        votingPower,
      };
    },
    {
      onError: () => {
        if (serverDisabled) {
          toggleError(true);
        }
      },
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: false,
    }
  );
};

export const useContractAddressQuery = () => {
  return useQuery(
    [QueryKeys.CONTRACT_ADDRESS],
    () => api.getContractAddress(),
    {
      staleTime: Infinity,
    }
  );
};

/// TODO run server helath check always

export const useProposalInfoQuery = () => {
  return useQuery<ProposalInfo | undefined>([QueryKeys.PROPOSAL_INFO], {
    staleTime: Infinity,
    enabled: false,
  });
};

export const useStateData = () => {
  const queryClient = useQueryClient();
  const getData = (): GetState | undefined =>
    queryClient.getQueryData([QueryKeys.STATE]);

  const setData = (data: GetState) => {
    return queryClient.setQueryData(
      [QueryKeys.STATE],
      (old: GetState | undefined) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          data,
        };
      }
    );
  };

  return {
    getData,
    setData,
  };
};

const useIsGetDataFromContract = () => {
  const { serverDisabled, isCustomEndpoints } = usePersistedStore();

  return serverDisabled || isCustomEndpoints;
};


export const useServerHealthCheckQuery = () => {
  return useQuery([], () => {})
}

export const useServerStateUpdateQuery = () => {
  const { setStateUpdateTime, stateUpdateTime } = useDataUpdaterStore();
  const { disableServer, serverDisabled } = usePersistedStore();
  const { refetch: getState } = useStateQuery();
  const { clientV2, clientV4 } = useClient();
  const { data: contractAddress } = useContractAddressQuery();

  return useQuery(
    [QueryKeys.SERVER_STATE_UPDATER],
    async () => {
      const newStateUpdateTime = await api.getStateUpdateTime();
      const lastFetchUpdate = await api.getLastFetchUpdate();

      // if time between now and last fetch time is greater than 90 seconds, disable server
      if (moment().valueOf() - lastFetchUpdate > LAST_FETCH_UPDATE_LIMIT) {
        disableServer();
        return null;
      }
      // if new state update time is not equal to prev state update time, trigger fetch from server
      if (stateUpdateTime !== newStateUpdateTime) {
        getState();
        setStateUpdateTime(newStateUpdateTime);
      }
      return null;
    },
    {
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4 && !serverDisabled && !!contractAddress,
    }
  );
};

export const useContractStateUpdateQuery = () => {
  const { serverDisabled } = usePersistedStore();
  const { clientV2, clientV4 } = useClient();
  const { maxLt, setMaxLt } = useMaxLtStore();
  const { addToList } = useTransactionsList();
  const { refetch: getState } = useStateQuery();
  const { toggleError } = useSetEndpointPopup();
  const { data: contractAddress } = useContractAddressQuery();

  return useQuery(
    [QueryKeys.CONTRACT_STATE_UPDATER],
    async () => {
      const result: GetTransactionsPayload = await getTransactions(
        clientV2,
        contractAddress,
        maxLt
      );

      if (result.allTxns.length > 0) {
        addToList(result.allTxns);
        getState();
        setMaxLt(result.maxLt);
      }
      return null;
    },
    {
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4 && serverDisabled && !!contractAddress,
      onError: () => {
        toggleError(true);
      },
    }
  );
};

export const useResetQueries = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.resetQueries({ queryKey: [QueryKeys.PROPOSAL_INFO] });
    queryClient.resetQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
    queryClient.resetQueries({ queryKey: [QueryKeys.STATE] });
  };
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
  return {
    getList,
    addToList,
  };
};

export const useHandleWalletVote = () => {
  const walletAddress = useWalletAddress();
  const { deleteVote, getVote: getVoteFromLocalStorage } =
    useLocalStorageWalletVote();
  return (votes: Vote[]) => {
    if (!walletAddress) return votes;
    let vote;
    const voteFromList = votes.find((it) => it.address === walletAddress);
    if (voteFromList) {
      deleteVote();
      vote = voteFromList;
    } else {
      vote = getVoteFromLocalStorage();
    }

    if (!vote) {
      return votes;
    }

    return unshiftWalletVote(votes, walletAddress!, vote);
  };
};

export const useSendTransaction = () => {
  const connection = useConnection();
  const address = useWalletAddress();
  const { clientV2 } = useClient();
  const [txApproved, setTxApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const addVoteManually = useAddWalletVoteManually();
  const query = useMutation(
    async ({ value }: { value: "yes" | "no" | "abstain" }) => {
      const cell = new Cell();
      new CommentMessage(value).writeTo(cell);
      setIsLoading(true);

      const waiter = await waitForSeqno(
        clientV2!.openWalletFromAddress({
          source: Address.parse(address!),
        })
      );
      const onSuccess = async () => {
        setTxApproved(true);
        await waiter();
        await addVoteManually(value);
        setTxApproved(false);
        setIsLoading(false);
      };

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

export const useGetAddressVotingPower = () => {
  const clientV4 = useClient().clientV4;
  const mcSnapshotBlock = useProposalInfoQuery().data?.snapshot.mcSnapshotBlock;
  return useMutation(async ({ address }: { address: string }) => {
    if (!address || !mcSnapshotBlock || !clientV4) return;
    return (
      await clientV4.getAccountLite(
        Number(mcSnapshotBlock),
        Address.parse(address)
      )
    ).account.balance.coins;
  });
};
