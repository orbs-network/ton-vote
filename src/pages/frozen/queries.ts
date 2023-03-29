import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import analytics from "analytics";
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
import { useGetTransaction } from "connection";
import {
  filterTxByTimestamp,
  getProposalInfo,
  getTransactions,
} from "./frozen-contracts-api/logic";
import { useGetContractState, useWalletVote } from "./hooks";
import _ from "lodash";
import moment from "moment";
import { useState } from "react";
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
  Transaction,
} from "./types";
import { Logger, parseVotes, waitForSeqno } from "./utils";



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
      queryKey: [QueryKeys.FROZEN_PROPOSAL_INFO],
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



export const useFrozenStateQuery = () => {
  const { clientV2, clientV4 } = useClientStore();
  const { setEndpointError } = useEndpointStore();
  const { getStateData: getStateCurrentData } = useDataFromQueryClient();
  const txLoading = useTxStore().txLoading;

  const getContractStateCallback = useGetContractStateCallback();
  return useQuery(
    [QueryKeys.FROZEN_STATE],
    async () => {

      const onContractState = async () => {
        const data = await getContractStateCallback();
        return data || getStateCurrentData();
      };

      return onContractState();

    },
    {
      onError: () => {
        setEndpointError(true);
      },
      enabled: !!clientV2 && !!clientV4 && !txLoading,
      staleTime: Infinity,
    }
  );
};

export const useDataFromQueryClient = () => {
  const queryClient = useQueryClient();
  const getStateData = (): GetState | undefined => {
    return queryClient.getQueryData([QueryKeys.FROZEN_STATE]);
  };

  const setStateData = (newData: GetState) => {
    queryClient.setQueryData<GetState | undefined>(
      [QueryKeys.FROZEN_STATE],
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

export const useFrozenProposalInfoQuery = () => {
  return useQuery<ProposalInfo | undefined>([QueryKeys.FROZEN_PROPOSAL_INFO], {
    staleTime: Infinity,
    enabled: false,
  });
};

export const useIsFetchFromServer = () => {
  // const { serverDisabled, isCustomEndpoints } = usePersistedStore();

  // if (serverDisabled || isCustomEndpoints) {
  //   return false;
  // }

  return false;
};

const useOnVoteCallback = () => {
  const getContractState = useGetContractState();
  const proposalInfo = useFrozenProposalInfoQuery().data;
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
  const connector = useConnectionStore().connectorTC;
  const getTransaction = useGetTransaction();

  const query = useMutation(
    async (vote: string) => {
      analytics.GA.txSubmitted(vote);

      setTxLoading(true);

      const waiter = await waitForSeqno(
        clientV2!.openWalletFromAddress({
          source: Address.parse(address!),
        })
      );

      const onSuccess = async () => {
        setTxApproved(true);
        analytics.GA.txConfirmed(vote);
        await waiter();
        await onVoteFinished();
        setTxApproved(false);
        setTxLoading(false);
        analytics.GA.txCompleted(vote);
        showNotification({
          variant: "success",
          message: TX_SUBMIT_SUCCESS_TEXT,
        });
      };

      const transaction = getTransaction(vote, onSuccess);
      return transaction;
    },
    {
      onError: (error: any, vote) => {
        if (error instanceof Error) {
          analytics.GA.txFailed(vote, error.message);
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
