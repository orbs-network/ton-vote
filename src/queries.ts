import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "api";
import { useNotification } from "components";
import {
  CONTRACT_ADDRESS,
  LAST_FETCH_UPDATE_LIMIT,
  STATE_REFETCH_INTERVAL,
  TX_FEE,
  TX_SUBMIT_ERROR_TEXT,
  TX_SUBMIT_SUCCESS_TEXT,
} from "config";
import { getProposalInfo, getTransactions } from "contracts-api/logic";
import { useGetContractState, useWalletVote } from "hooks";
import _ from "lodash";
import moment from "moment";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import {
  useClientStore,
  useConnectionStore,
  useContractStore,
  useEndpointStore,
  usePersistedStore,
  useServerStore,
  useTxStore,
  useVotesPaginationStore,
} from "store";
import { Address, Cell, CommentMessage, toNano } from "ton";
import {
  QueryKeys,
  GetTransactionsPayload,
  GetState,
  ProposalInfo,
} from "types";
import { Logger, parseVotes, waitForSeqno } from "utils";

const useGetServerStateCallback = () => {
  const { serverUpdateTime, setServerUpdateTime } = useServerStore();
  const handleWalletVote = useWalletVote();
  const setServerMaxLt = useServerStore().setServerMaxLt;
  const queryClient = useQueryClient();

  return async () => {
    Logger("Fetching from server");
    const newStateUpdateTime = await api.getStateUpdateTime();
    // if new state update time is not equal to prev state update time, trigger fetch from server
    if (serverUpdateTime === newStateUpdateTime) {
      return;
    }

    setServerUpdateTime(newStateUpdateTime);
    const state = await api.getState();

    setServerMaxLt(state.maxLt);

    await queryClient.ensureQueryData({
      queryKey: [QueryKeys.PROPOSAL_INFO],
      queryFn: () => api.getProposalInfo(),
    });

    const votes = parseVotes(state.votes, state.votingPower);

    return {
      votes: handleWalletVote(votes),
      proposalResults: state.proposalResults,
      votingPower: state.votingPower,
    };
  };
};

const useGetContractStateCallback = () => {
  const { contractMaxLt, setContractMaxLt, addContractTransactions } =
    useContractStore();
  const { clientV2, clientV4 } = useClientStore();
  const queryClient = useQueryClient();
  const getContractState = useGetContractState();
  const getStateData = useDataFromQueryClient().getStateData;
  const handleWalletVote = useWalletVote();

  return async () => {
    Logger("Fetching from contract");
    const result: GetTransactionsPayload = await getTransactions(
      clientV2,
      contractMaxLt
    );
    // fetch from contract only if got new transactions
    if (result.allTxns.length === 0) {
      return;
    }

    const transactions = addContractTransactions(result.allTxns) || [];

    setContractMaxLt(result.maxLt);
    const proposalInfo = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.PROPOSAL_INFO],
      queryFn: () => getProposalInfo(clientV2, clientV4),
    });

    const data = await getContractState(
      proposalInfo,
      transactions,
      getStateData()?.votingPower
    );

    return {
      votes: handleWalletVote(data.votes),
      proposalResults: data.proposalResults,
      votingPower: data.votingPower,
    };
  };
};

const useCheckServerhealth = () => {
  return async () => {
    try {
      const lastFetchUpdate = await api.getLastFetchUpdate();

      return moment().valueOf() - lastFetchUpdate > LAST_FETCH_UPDATE_LIMIT;
    } catch (error) {
      return true;
    }
  };
};

export const useStateQuery = () => {
  const { clientV2, clientV4 } = useClientStore();
  const { setEndpointError } = useEndpointStore();
  const fetchFromServer = useIsFetchFromServer();
  const { getStateData } = useDataFromQueryClient();
  const { maxLt, clearMaxLt } = usePersistedStore();
  const txLoading = useTxStore().txLoading;
  const checkServerHealth = useCheckServerhealth();

  const getServerStateCallback = useGetServerStateCallback();
  const getContractStateCallback = useGetContractStateCallback();
  return useQuery(
    [QueryKeys.STATE],
    async () => {
      const onServerState = async () => {
        const data = await getServerStateCallback();
        return data || getStateData();
      };

      const onContractState = async () => {
        const data = await getContractStateCallback();
        return data || getStateData();
      };

      if (!fetchFromServer) {
        return onContractState();
      }

      const isSrverError = await checkServerHealth();

      if (isSrverError) {
        return onContractState();
      }

      if (!maxLt) {
        return onServerState();
      }
      const serverMaxLt = await api.getMaxLt();

      if (Number(serverMaxLt) >= Number(maxLt || "0")) {
        Logger(
          `server is up to date, fetching from server matLt:${serverMaxLt} currentMaxLt:${maxLt}`
        );
        clearMaxLt();

        return onServerState();
      }
      Logger(
        `server is outdated, fetching from contract, server maxLt:${serverMaxLt} currentMaxLt:${maxLt}`
      );
      return onContractState();
    },
    {
      onError: () => {
        setEndpointError(true);
      },
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4 && !txLoading,
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


export const useProposalInfoQuery = () => {
  return useQuery<ProposalInfo | undefined>([QueryKeys.PROPOSAL_INFO], {
    staleTime: Infinity,
    enabled: false,
  });
};

export const useIsFetchFromServer = () => {
  const { serverDisabled, isCustomEndpoints } = usePersistedStore();

  if (serverDisabled || isCustomEndpoints) {
    return false;
  }

  return true;
};

const useOnVoteCallback = () => {
  const getContractState = useGetContractState();
  const proposalInfo = useProposalInfoQuery().data;
  const { showMoreVotes } = useVotesPaginationStore();
  const clientV2 = useClientStore().clientV2;
  const { setStateData, getStateData } = useDataFromQueryClient();
  const { setMaxLt } = usePersistedStore();
  return useMutation(
    async () => {
      Logger("fetching data from contract after transaction");
      const transactions = await getTransactions(clientV2);
      const state = await getContractState(
        proposalInfo!,
        transactions.allTxns,
        getStateData()?.votingPower
      );
      return {
        maxLt: transactions.maxLt,
        state,
      };
    },
    {
      onSuccess: ({ maxLt, state }) => {
        const currentVotesLength = getStateData()?.votes.length || 0;
        const newVotesLength = state.votes.length || 0;
        showMoreVotes(newVotesLength - currentVotesLength);
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
  const { connection, address } = useConnectionStore();
  const clientV2 = useClientStore().clientV2;
  const [txApproved, setTxApproved] = useState(false);
  const { mutateAsync: onVoteFinished } = useOnVoteCallback();
  const { showNotification } = useNotification();
  const { txLoading, setTxLoading } = useTxStore();

  const query = useMutation(
    async ({ value }: { value: "yes" | "no" | "abstain" }) => {
      const cell = new Cell();
      new CommentMessage(value).writeTo(cell);
      setTxLoading(true);

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
        setTxLoading(false);
        showNotification({
          variant: "success",
          message: TX_SUBMIT_SUCCESS_TEXT,
        });
      };

      if (isMobile) {
        await connection?.requestTransaction({
          to: CONTRACT_ADDRESS,
          value: toNano(TX_FEE),
          message: cell,
        });
        await onSuccess();
      } else {
        await connection?.requestTransaction(
          {
            to: CONTRACT_ADDRESS,
            value: toNano(TX_FEE),
            message: cell,
          },
          onSuccess
        );
      }
    },
    {
      onError: () => {
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
