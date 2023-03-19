import {
  useMutation,
  useQueryClient,
  useQuery,
  QueryKey,
} from "@tanstack/react-query";
import analytics from "analytics";
import { useNotification } from "components";
import {
  QueryKeys,
  STATE_REFETCH_INTERVAL,
  LAST_FETCH_UPDATE_LIMIT,
  TX_SUBMIT_SUCCESS_TEXT,
  TX_SUBMIT_ERROR_TEXT,
  voteOptions,
} from "config";
import { useConnectionStore, useGetTransaction } from "connection";
import { contractDataService, serverDataService } from "data-service";
import { useProposalId, useDaoId } from "hooks";
import _ from "lodash";
import moment from "moment";
import { useMemo, useEffect, useState } from "react";
import { useIsCustomEndpoint, useEnpointModalStore } from "store";
import { Address, TonTransaction } from "ton";
import {
  ProposalState,
  GetTransactionsPayload,
  ProposalInfo,
  Vote,
} from "types";
import { nFormatter, waitForSeqno, getProposalStatus, Logger } from "utils";
import { useProposalStore, useProposalPersistStore } from "./store";

export const useProposalVotesCount = () => {
  const { proposalVotes, dataUpdatedAt } = useProposalVotes();

  return useMemo(() => {
    const grouped = _.groupBy(proposalVotes, "vote");

    return {
      yes: nFormatter(_.size(grouped.Yes)),
      no: nFormatter(_.size(grouped.No)),
      abstain: nFormatter(_.size(grouped.Abstain)),
    };
  }, [dataUpdatedAt]);
};

export const useProposalResults = () => {
  const query = useProposalStateQuery();

  return { ...query, proposalResults: query.data?.proposalResults };
};

export const useProposalVotes = () => {
  const query = useProposalStateQuery();
  const walletAddress = useConnectionStore().address;

  const _proposalVotes = query.data?.votes;
  const size = _.size(_proposalVotes);

  const { proposalVotes, walletVote } = useMemo(() => {
    return {
      proposalVotes: _.filter(
        _proposalVotes,
        (it) => it.address !== walletAddress
      ),
      walletVote: _.find(_proposalVotes, (it) => it.address === walletAddress),
    };
  }, [size, walletAddress]);

  return { ...query, proposalVotes, walletVote };
};

export const useVerifyProposalResults = () => {
  const currentProposalResults = useProposalResults().proposalResults;
  const getMaxLt = useGetProposalMaxLt();
  const proposalId = useProposalId();

  const query = useMutation(async () => {
    const compare = (first: any, second: any) => {
      const firstValue = isNaN(first) ? 0 : Number(first);
      const secondValue = isNaN(second) ? 0 : Number(second);

      return firstValue === secondValue;
    };

    analytics.GA.verifyButtonClick();
    const { proposalResults: contractProposalResults } =
      await contractDataService.getStateUntilMaxLt(proposalId, getMaxLt());

    Logger({ currentProposalResults, contractProposalResults });

    const yes = compare(
      currentProposalResults?.yes,
      contractProposalResults.yes
    );

    const no = compare(currentProposalResults?.no, contractProposalResults.no);
    const totalWeight = compare(
      currentProposalResults?.totalWeight,
      contractProposalResults.totalWeight
    );
    const abstain = compare(
      currentProposalResults?.abstain,
      contractProposalResults.abstain
    );

    return yes && no && abstain && totalWeight;
  });

  return {
    ...query,
    isReady: !!currentProposalResults,
  };
};

export const useGetProposalMaxLt = () => {
  const queryKey = useStateQueryWithParams(QueryKeys.STATE);
  const queryClient = useQueryClient();

  return () => {
    const state: ProposalState | undefined = queryClient.getQueryData(queryKey);
    return state?.maxLt;
  };
};

const useContractTransactions = () => {
  const queryClient = useQueryClient();
  const queryKey = useStateQueryWithParams(QueryKeys.PROPOSAL_TRANSACTIONS);
  const getTransactions = () =>
    queryClient.getQueryData(queryKey) as TonTransaction[] | undefined;

  const addTransactions = (newTransactions: TonTransaction[]) => {
    const transactions = getTransactions() || [];
    transactions.unshift(...newTransactions);
    queryClient.setQueryData(queryKey, transactions);
    return transactions;
  };
  return {
    getTransactions,
    addTransactions,
  };
};

const useFetchFromContract = () => {
  const { addTransactions } = useContractTransactions();
  const getProposalMaxLt = useGetProposalMaxLt();
  const getCurrentState = useGetProposalState();
  const proposalId = useProposalId();

  return async (proposalInfo: ProposalInfo): Promise<ProposalState> => {
    const result: GetTransactionsPayload =
      await contractDataService.getTransactions(proposalId, getProposalMaxLt());
    // fetch from contract only if got new transactions

    if (result.allTxns.length === 0) {
      const state = getCurrentState() || ({} as ProposalState);
      return {
        ...state,
        maxLt: result.maxLt,
      };
    }

    const state = await contractDataService.getState(
      proposalInfo,
      addTransactions(result.allTxns) || [],
      getCurrentState()?.votingPower
    );
    return {
      ...state,
      maxLt: result.maxLt,
    };
  };
};

const useGetProposalInfo = () => {
  const proposalId = useProposalId();
  const isCustomEndpoint = useIsCustomEndpoint();

  return () => {
    if (isCustomEndpoint) {
      return contractDataService.getDAOProposalInfo(proposalId);
    } else {
      return serverDataService.getDAOProposalInfo(proposalId);
    }
  };
};

const useEnsureProposalInfoQuery = () => {
  const queryClient = useQueryClient();
  const queryKey = useStateQueryWithParams(QueryKeys.PROPOSAL_INFO);
  const getProposalInfo = useGetProposalInfo();

  return async () => {
    return queryClient.ensureQueryData({
      queryKey,
      queryFn: getProposalInfo,
    });
  };
};

// we use this in case that user did refresh after sending tx,
// and have minMaxLt in the persisted store, and the server is outdated
const useFetchFromContractWhileServerOutdated = () => {
  const getProposalState = useGetProposalState();
  const { latestMaxLtAfterTx } = useLatestMaxLtAfterTx();
  const proposalId = useProposalId();

  return async (): Promise<ProposalState> => {
    const state = getProposalState();
    if (state) return state;
    return contractDataService.getStateUntilMaxLt(
      proposalId,
      latestMaxLtAfterTx
    );
  };
};

export const useProposalStateQuery = () => {
  const { setEndpointError } = useEnpointModalStore();
  const isCustomEndpoint = useIsCustomEndpoint();
  const { updateMaxLtAfterTx, latestMaxLtAfterTx } = useLatestMaxLtAfterTx();
  const getStatewhileServerOutdatedAndStateEmpty =
    useFetchFromContractWhileServerOutdated();
  const getContractState = useFetchFromContract();
  const ensureProposalInfo = useEnsureProposalInfoQuery();
  const getProposalState = useGetProposalState();

  const { data: voteTimeline } = useVoteTimeline();

  const queryKey = useStateQueryWithParams(QueryKeys.STATE);

  const refetchInterval =
    voteTimeline?.status === "in-progress" ? STATE_REFETCH_INTERVAL : undefined;

  return useQuery(
    queryKey,
    async () => {
      const proposalInfo = await ensureProposalInfo();

      const proposalState = getProposalState();

      //   if (voteTimeline?.status === "finished" && proposalState) {
      //     return proposalState;
      //   }
      if (isCustomEndpoint) {
        Logger("custom endpoint, fetching from contract");
        return getContractState(proposalInfo);
      }

      const isServerLastUpdateTimeInvalid =
        moment().valueOf() - (await serverDataService.getLastFetchUpdate()) >
        LAST_FETCH_UPDATE_LIMIT;

      if (isServerLastUpdateTimeInvalid) {
        Logger("server last fetch update error, fetching from contract");

        return getContractState(proposalInfo);
      }

      if (!latestMaxLtAfterTx) {
        Logger("fetching from server");
        return serverDataService.getState();
      }
      const serverMaxLt = await serverDataService.getMaxLt();

      if (Number(serverMaxLt) >= Number(latestMaxLtAfterTx || "0")) {
        Logger(
          `server is up to date, fetching from server matLt:${serverMaxLt} currentMaxLt:${latestMaxLtAfterTx}`
        );
        updateMaxLtAfterTx(undefined);

        return serverDataService.getState();
      }

      Logger(
        `server is outdated, server maxLt:${serverMaxLt} currentMaxLt:${latestMaxLtAfterTx}`
      );
      return getStatewhileServerOutdatedAndStateEmpty();
    },
    {
      onError: () => setEndpointError(true),
      refetchInterval,
        staleTime: 2_000,
    }
  );
};

const useGetProposalState = () => {
  const queryClient = useQueryClient();
  const queryKey = useStateQueryWithParams(QueryKeys.STATE);

  return () => {
    return queryClient.getQueryData(queryKey) as ProposalState | undefined;
  };
};

const useUpdateProposalState = () => {
  const queryClient = useQueryClient();
  const queryKey = useStateQueryWithParams(QueryKeys.STATE);

  return (newData: ProposalState) => {
    queryClient.setQueryData<ProposalState | undefined>(queryKey, (oldData) => {
      return oldData ? { ...oldData, ...newData } : newData;
    });
  };
};

export const useProposalInfoQuery = () => {
  const queryKey = useStateQueryWithParams(QueryKeys.PROPOSAL_INFO);
  const getProposalInfo = useGetProposalInfo();

  return useQuery<ProposalInfo | undefined>(queryKey, () => getProposalInfo(), {
    staleTime: Infinity,
  });
};

const useOnVoteCallback = () => {
  const proposalInfo = useProposalInfoQuery().data;

  const getProposalState = useGetProposalState();
  const updateProposalState = useUpdateProposalState();

  const { updateMaxLtAfterTx } = useLatestMaxLtAfterTx();
  const proposalId = useProposalId();

  return useMutation(
    async () => {
      Logger("fetching data from contract after transaction");
      const { allTxns, maxLt } = await contractDataService.getTransactions(
        proposalId
      );
      const state = await contractDataService.getState(
        proposalInfo!,
        allTxns,
        getProposalState()?.votingPower
      );
      return {
        maxLt,
        state,
      };
    },
    {
      onSuccess: ({ maxLt, state }) => {
        const newData: ProposalState = {
          proposalResults: state.proposalResults,
          votes: state.votes,
          votingPower: state.votingPower,
        };
        updateMaxLtAfterTx(maxLt);
        updateProposalState(newData);
      },
    }
  );
};

export const useSendTransaction = () => {
  const { address } = useConnectionStore();
  const clientV2 = useConnectionStore().clientV2;
  const [txApproved, setTxApproved] = useState(false);
  const { mutateAsync: onVoteFinished } = useOnVoteCallback();
  const { showNotification } = useNotification();
  const { txLoading, setTxLoading } = useProposalStore();
  const getTransaction = useGetTransaction();
  const proposalId = useProposalId();

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

      return getTransaction(proposalId, vote, onSuccess);
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

export const useVoteTimeline = () => {
  const { data: info, isLoading } = useProposalInfoQuery();
  const queryKey = useStateQueryWithParams(QueryKeys.PROPOSAL_TIMELINE);

  return useQuery(
    queryKey,
    () => {
      if (!info) return null;

      return {
        ...getProposalStatus(Number(info.startTime), Number(info.endTime)),
        isLoading,
      };
    },
    {
      enabled: !!info,
      refetchInterval: 1_000,
    }
  );
};

export const useStateQueryWithParams = (key: string): QueryKey => {
  const daoId = useDaoId();
  const daoProposalId = useProposalId();
  return [key, daoId, daoProposalId];
};

export const useLatestMaxLtAfterTx = () => {
  const { latestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistStore();

  const daoProposalId = useProposalId();
  return {
    latestMaxLtAfterTx: latestMaxLtAfterTx[daoProposalId],
    updateMaxLtAfterTx: (value?: string) =>
      setLatestMaxLtAfterTx(daoProposalId, value),
  };
};
