import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "api";
import {
  LAST_FETCH_UPDATE_LIMIT,
  STATE_REFETCH_INTERVAL,
  TX_FEE,
} from "config";
import {
  getAllVotes,
  getCurrentResults,
  getProposalInfo,
  getTransactions,
  getVotingPower,
} from "contracts-api/logic";
import _ from "lodash";
import moment from "moment";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import {
  useClient,
  useSetEndpointPopup,
  useDataUpdaterStore,
  usePersistedStore,
  useWalletAddress,
  useConnection,
  useVotesPaginationStore,
  useStateDataStore,
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

const useGetStateFromServer = () => {
  const queryClient = useQueryClient();
  const prepareVotes = usePrepareVotes();

  return async () => {
    const state = await api.getState();

    const proposalInfo = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.PROPOSAL_INFO],
      queryFn: () => api.getProposalInfo(),
    });
    const rawVotes = state.votes;
    const proposalResults = state.proposalResults;
    const votingPower = state.votingPower;
    return {
      proposalInfo,
      votes: prepareVotes(rawVotes, votingPower),
      proposalResults,
      votingPower,
    };
  };
};

export const useGetStateFromContract = () => {
  const { clientV2, clientV4 } = useClient();
  const queryClient = useQueryClient();
  const contractAddress = useContractAddressQuery().data;
  const prepareVotes = usePrepareVotes();
  return async (
    transactions: Transaction[],
    currentVotingPower?: VotingPower
  ) => {
    const proposalInfo = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.PROPOSAL_INFO],
      queryFn: () => getProposalInfo(clientV2, clientV4, contractAddress),
    });

    const votingPower = await getVotingPower(
      clientV4,
      proposalInfo,
      transactions,
      currentVotingPower
    );

    const rawVotes = getAllVotes(transactions, proposalInfo) as RawVotes;

    const proposalResults = getCurrentResults(
      transactions,
      votingPower,
      proposalInfo
    );
    return {
      proposalInfo,
      votes: prepareVotes(rawVotes, votingPower),
      proposalResults,
      votingPower,
    };
  };
};

const usePrepareVotes = () => {
  const walletAddress = useWalletAddress();

  return (rawVotes: RawVotes, votingPower: VotingPower) => {
    let votes: Vote[] = _.map(rawVotes, (v: RawVote, key: string) => {
      const _votingPower = votingPower[key];
      return {
        address: key,
        vote: v.vote,
        votingPower: _votingPower ? fromNano(_votingPower) : "0",
        timestamp: v.timestamp,
      };
    });

    const sortedVotes = _.orderBy(votes, "timestamp", ["desc", "asc"]);
    if (!walletAddress) {
      return sortedVotes;
    }
    let vote = votes.find((it) => it.address === walletAddress);

    if (!vote) {
      return sortedVotes;
    }

    return unshiftWalletVote(sortedVotes, walletAddress, vote);
  };
};

export const useStateMutation = () => {
  const { toggleError } = useSetEndpointPopup();
  const getStateFromServer = useGetStateFromServer();
  const getStateFromContract = useGetStateFromContract();
  const { transactions } = useStateDataStore();
  const { setData, votingPower: currentVotingPower } = useStateDataStore();

  return useMutation(
    async ({ fetchFromServer }: { fetchFromServer: boolean }) => {
      let data = {
        votes: [] as Vote[],
        proposalResults: {} as Results,
        votingPower: {} as VotingPower,
        proposalInfo: {} as ProposalInfo,
      };

      if (fetchFromServer) {
        console.log("fetching from server");

        data = await getStateFromServer();
      } else {
        console.log("fetching from contract");

        data = await getStateFromContract(transactions, currentVotingPower);
      }

      return {
        votes: data.votes,
        proposalResults: data.proposalResults,
        votingPower: data.votingPower,
      };
    },
    {
      onError: () => toggleError(true),
      onSuccess: (result) => {
        setData(result.votes, result.proposalResults, result.votingPower);
      },
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

export const useProposalInfoQuery = () => {
  return useQuery<ProposalInfo | undefined>([QueryKeys.PROPOSAL_INFO], {
    staleTime: Infinity,
    enabled: false,
  });
};

const useIsFetchFromServer = () => {
  const { serverDisabled, isCustomEndpoints } = usePersistedStore();
  return !serverDisabled && !isCustomEndpoints;
};

export const useServerHealthCheckQuery = () => {
  const { disableServer, isCustomEndpoints, enableServer } =
    usePersistedStore();
  return useQuery(
    [QueryKeys.SERVER_HEALTH_CHECK],
    async () => {
      const lastFetchUpdate = await api.getLastFetchUpdate();

      if (moment().valueOf() - lastFetchUpdate > LAST_FETCH_UPDATE_LIMIT) {
        disableServer();
      } else {
        enableServer();
      }
      return null;
    },
    {
      enabled: !isCustomEndpoints,
    }
  );
};

export const useDataUpdaters = () => {
  useStateUpdateQuery();
  useServerHealthCheckQuery();
};

export const useStateUpdateQuery = () => {
  const { setStateUpdateTime, stateUpdateTime } = useDataUpdaterStore();
  const { mutate: getState } = useStateMutation();
  const { clientV2, clientV4 } = useClient();
  const { data: contractAddress } = useContractAddressQuery();
  const fetchFromServer = useIsFetchFromServer();
  const { maxLt, addTransactions, clearTransactions, setMaxLt } =
    useStateDataStore();
  const { currentDataMaxLt, clearMaxLt } = usePersistedStore();
  const { toggleError } = useSetEndpointPopup();

  return useQuery(
    [QueryKeys.STATE_UPDATER],
    async () => {
      const getContractState = async () => {
        const result: GetTransactionsPayload = await getTransactions(
          clientV2,
          contractAddress,
          maxLt
        );

        if (result.allTxns.length > 0) {
          addTransactions(result.allTxns);
          getState({ fetchFromServer: false });
          setMaxLt(result.maxLt);
        }
      };

      const getServerState = async () => {
        clearTransactions();
        setMaxLt('')
        const newStateUpdateTime = await api.getStateUpdateTime();
        // if new state update time is not equal to prev state update time, trigger fetch from server
        if (stateUpdateTime !== newStateUpdateTime) {
          getState({ fetchFromServer: true });
          setStateUpdateTime(newStateUpdateTime);
        }
      };

      if (!fetchFromServer) {
        await getContractState();
        return null;
      }
      if (!currentDataMaxLt) {
        await getServerState();
        return null;
      }
      const serverState = await api.getState();

      const serverIsOudated =
        Number(serverState.maxLt) < Number(currentDataMaxLt || "0");

      if (serverIsOudated) {
        console.log("server state is outdated, fetching from contract");
        await getContractState();
        return null;
      }
      await getServerState();
      clearMaxLt();
      return null;
    },
    {
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4 && !!contractAddress,
      onError: () => {
        toggleError(true);
      },
    }
  );
};

export const useChangeEndpointCallback = () => {
  const queryClient = useQueryClient();
  const { refetch } = useStateUpdateQuery();

  return () => {
    queryClient.resetQueries({ queryKey: [QueryKeys.PROPOSAL_INFO] });
    refetch();
  };
};

const useOnVoteCallback = () => {
  const getStateFromContract = useGetStateFromContract();
  const { loadMore } = useVotesPaginationStore();
  const clientV2 = useClient().clientV2;
  const contractAddress = useContractAddressQuery().data;
  const { setData, votes } = useStateDataStore();
  const { setMaxLt } = usePersistedStore();
  return useMutation(
    async () => {
      const transactions = await getTransactions(clientV2, contractAddress);
      const state = await getStateFromContract(transactions.allTxns);
      return {
        maxLt: transactions.maxLt,
        state,
      };
    },
    {
      onSuccess: ({ maxLt, state }) => {
        const currentVotesLength = votes.length || 0;
        const newVotesLength = state.votes.length || 0;
        loadMore(newVotesLength - currentVotesLength);
        const newData: GetState = {
          proposalResults: state.proposalResults,
          votes: state.votes,
          votingPower: state.votingPower,
        };
        setMaxLt(maxLt);
        setData(newData.votes, newData.proposalResults, newData.votingPower);
      },
    }
  );
};

export const useSendTransaction = () => {
  const connection = useConnection();
  const address = useWalletAddress();
  const clientV2 = useClient().clientV2;
  const [txApproved, setTxApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: onVoteFinished } = useOnVoteCallback();

  const contractAddress = useContractAddressQuery().data;
  const query = useMutation(
    async ({ value }: { value: "yes" | "no" | "abstain" }) => {
      if (!contractAddress) return;
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
        await onVoteFinished();
        setTxApproved(false);
        setIsLoading(false);
      };

      if (isMobile || getAdapterName() === Provider.EXTENSION) {
        await connection?.requestTransaction({
          to: Address.parse(contractAddress),
          value: toNano(TX_FEE),
          message: cell,
        });
        await onSuccess();
      } else {
        await connection?.requestTransaction(
          {
            to: Address.parse(contractAddress),
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
