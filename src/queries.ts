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
import { useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import {
  useClient,
  useSetEndpointPopup,
  usePersistedStore,
  useWalletAddress,
  useConnection,
  useVotesPaginationStore,
  useTransactionsStore,
  useDataUpdaterStore,
} from "store";
import { Address, Cell, CommentMessage, fromNano, toNano } from "ton";
import {
  QueryKeys,
  GetTransactionsPayload,
  Vote,
  VotingPower,
  RawVotes,
  RawVote,
  GetState,
  ProposalInfo,
  Provider,
  Transaction,
} from "types";
import {
  getAdapterName,
  Logger,
  parseVotes,
  unshiftWalletVote,
  waitForSeqno,
} from "utils";

const useGetStateFromServer = () => {
  const queryClient = useQueryClient();
  const walletAddress = useWalletAddress();

  return async (): Promise<GetState> => {
    const state = await api.getState();
    await queryClient.ensureQueryData({
      queryKey: [QueryKeys.PROPOSAL_INFO],
      queryFn: () => api.getProposalInfo(),
    });

    const sortedVotes = parseVotes(state.votes, state.votingPower);

    return {
      votes: unshiftWalletVote(sortedVotes, walletAddress),
      proposalResults: state.proposalResults,
      votingPower: state.votingPower,
    };
  };
};

export const useGetStateFromContract = () => {
  const { clientV2, clientV4 } = useClient();
  const queryClient = useQueryClient();
  const contractAddress = useContractAddressQuery().data;
  const walletAddress = useWalletAddress();

  const { getStateData } = useDataFromQueryClient();

  return async (transactions: Transaction[]): Promise<GetState> => {
    const proposalInfo = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.PROPOSAL_INFO],
      queryFn: () => getProposalInfo(clientV2, clientV4, contractAddress),
    });

    const votingPower = await getVotingPower(
      clientV4,
      proposalInfo,
      transactions,
      getStateData()?.votingPower
    );

    const proposalResults = getCurrentResults(
      transactions,
      votingPower,
      proposalInfo
    );
    const rawVotes = getAllVotes(transactions, proposalInfo) as RawVotes;

    const sortedVotes = parseVotes(rawVotes, votingPower);

    return {
      votes: unshiftWalletVote(sortedVotes, walletAddress),
      proposalResults,
      votingPower,
    };
  };
};

export const useStateQuery = () => {
  const { clientV2, clientV4 } = useClient();
  const { toggleError } = useSetEndpointPopup();
  const getStateFromServerFn = useGetStateFromServer();
  const getStateFromContractFn = useGetStateFromContract();
  const contractAddress = useContractAddressQuery().data;
  const { page, addTransactions, setPage } = useTransactionsStore();
  const { stateUpdateTime, setStateUpdateTime } = useDataUpdaterStore();
  const fetchFromServer = useIsFetchFromServer();
  const { getStateData } = useDataFromQueryClient();
  const { maxLt, clearMaxLt } = usePersistedStore();

  return useQuery(
    [QueryKeys.STATE],
    async () => {
      const getServerState = async () => {
        Logger("Fetching from server");
        const newStateUpdateTime = await api.getStateUpdateTime();
        // if new state update time is not equal to prev state update time, trigger fetch from server
        if (stateUpdateTime === newStateUpdateTime) {
          return getStateData();
        }

        setStateUpdateTime(newStateUpdateTime);
        return getStateFromServerFn();
      };

      const getContractState = async () => {
        Logger("Fetching from contract");
        const result: GetTransactionsPayload = await getTransactions(
          clientV2,
          contractAddress,
          page
        );

        if (result.allTxns.length === 0) {
          return getStateData();
        }
        const transactions = addTransactions(result.allTxns);

        setPage(result.maxLt);
        return getStateFromContractFn(transactions);
      };

      if (!fetchFromServer) {
        return getContractState();
      }
      if (!maxLt) {
        return getServerState();
      }
      const serverState = await api.getState();

      if (Number(serverState.maxLt) < Number(maxLt || "0")) {
        Logger(
          `server is outdated, fetching from contract server maxLt:${serverState.maxLt} currentMaxLt:${maxLt}`
        );
        return getContractState();
      }
      Logger(
        `server is up to date, fetching from server matLt:${serverState.maxLt} currentMaxLt:${maxLt}`
      );
      clearMaxLt();

      return getServerState();
    },
    {
      onError: () => toggleError(true),
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4 && !!contractAddress,
      staleTime: Infinity,
    }
  );
};

export const useDataFromQueryClient = () => {
  const queryClient = useQueryClient();
  const getStateData = (): GetState | undefined => {
    return queryClient.getQueryData([QueryKeys.STATE]);
  };

  const setStateData = (newData: GetState) => {
    queryClient.setQueryData<GetState | undefined>(
      [QueryKeys.STATE],
      (oldData) => {
        return oldData ? { ...oldData, ...newData } : newData;
      }
    );
  };

  return {
    getStateData,
    setStateData,
  };
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

  if (serverDisabled || isCustomEndpoints) {
    return false;
  }

  return true;
};

export const useServerHealthCheckQuery = () => {
  const { disableServer, isCustomEndpoints } = usePersistedStore();
  return useQuery(
    [QueryKeys.SERVER_HEALTH_CHECK],
    async () => {
      const lastFetchUpdate = await api.getLastFetchUpdate();
      disableServer(
        moment().valueOf() - lastFetchUpdate > LAST_FETCH_UPDATE_LIMIT
      );

      return null;
    },
    {
      enabled: !isCustomEndpoints,
    }
  );
};

export const useDataUpdaters = () => {
  useServerHealthCheckQuery();
};

const useOnVoteCallback = () => {
  const getStateFromContract = useGetStateFromContract();
  const { loadMore } = useVotesPaginationStore();
  const clientV2 = useClient().clientV2;
  const contractAddress = useContractAddressQuery().data;
  const { setStateData, getStateData } = useDataFromQueryClient();
  const { setMaxLt } = usePersistedStore();
  return useMutation(
    async () => {
      Logger("fetching data from contract after transaction");
      const transactions = await getTransactions(clientV2, contractAddress);
      const state = await getStateFromContract(transactions.allTxns);
      return {
        maxLt: transactions.maxLt,
        state,
      };
    },
    {
      onSuccess: ({ maxLt, state }) => {
        const currentVotesLength = getStateData()?.votes.length || 0;
        const newVotesLength = state.votes.length || 0;
        loadMore(newVotesLength - currentVotesLength);
        const newData: GetState = {
          proposalResults: state.proposalResults,
          votes: state.votes,
          votingPower: state.votingPower,
        };
        setMaxLt(maxLt);
        setStateData(newData);
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

export const useIsVoteEnded = () => {
  const endDate = useProposalInfoQuery().data?.endDate;

  return useMemo(() => {
    if (!endDate) {
      return false;
    }
    return moment.unix(Number(endDate)).utc().valueOf() < moment().valueOf();
  }, [endDate]);
};
