import {
  useMutation,
  useQueryClient,
  useQuery,
  QueryKey,
} from "@tanstack/react-query";
import analytics from "analytics";
import { QueryKeys, STATE_REFETCH_INTERVAL } from "config";
import { useConnectionStore } from "connection";
import { contract, server } from "data-service";
import { useProposalId, useDaoId, useIsCustomEndpoint } from "hooks";
import _ from "lodash";
import { getServerFetchUpdateValid, useSendTransaction } from "logic";
import { useMemo } from "react";
import { useEnpointModalStore, useAppPersistedStore } from "store";
import {  Transaction } from "ton";
import { ProposalState, ProposalInfo, ProposalStatus } from "types";
import { nFormatter, getProposalStatus, Logger } from "utils";

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
      await contract.getStateUntilMaxLt(proposalId, getMaxLt());

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
  const queryKey = useQueryKeyWithParams(QueryKeys.STATE);
  const queryClient = useQueryClient();

  return () => {
    const state: ProposalState | undefined = queryClient.getQueryData(queryKey);
    return state?.maxLt;
  };
};

const useContractTransactions = () => {
  const queryClient = useQueryClient();
  const queryKey = useQueryKeyWithParams(QueryKeys.PROPOSAL_TRANSACTIONS);
  const getTransactions = () =>
    queryClient.getQueryData(queryKey) as Transaction[] | undefined;

  const addTransactions = (newTransactions: Transaction[]) => {
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
    const currentState = getCurrentState();
    const result = await contract.getTransactions(
      proposalId,
      getProposalMaxLt()
    );
    // fetch from contract only if got new transactions
    if (result.allTxns.length === 0) {
      const state = currentState || ({} as ProposalState);
      return {
        ...state,
        maxLt: result.maxLt,
      };
    }

    const state = await contract.getState(
      proposalInfo,
      addTransactions(result.allTxns) || [],
      currentState?.votingPower
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
      return contract.getDaoProposalInfo(proposalId);
    }
    return server.getDaoProposalInfo(proposalId);
  };
};

const useEnsureProposalInfoQuery = () => {
  const queryClient = useQueryClient();
  const queryKey = useQueryKeyWithParams(QueryKeys.PROPOSAL_INFO);
  const getProposalInfo = useGetProposalInfo();

  return async () => {
    return queryClient.ensureQueryData({
      queryKey,
      queryFn: getProposalInfo,
    });
  };
};

export const useProposalStateQuery = () => {
  const { setEndpointError } = useEnpointModalStore();
  const isCustomEndpoint = useIsCustomEndpoint();
  const { updateMaxLtAfterTx, latestMaxLtAfterTx } = useLatestMaxLtAfterTx();

  const getContractState = useFetchFromContract();
  const ensureProposalInfo = useEnsureProposalInfoQuery();

  const proposalStatus = useProposalStatus();

  const proposalId = useProposalId();

  const queryKey = useQueryKeyWithParams(QueryKeys.STATE);

  const voteFinished = proposalStatus === ProposalStatus.CLOSED;

  return useQuery(
    queryKey,
    async () => {
      const proposalInfo = await ensureProposalInfo();

      if (isCustomEndpoint) {
        Logger("custom endpoint, fetching from contract");
        return getContractState(proposalInfo);
      }

      if (!(await getServerFetchUpdateValid())) {
        Logger("server last fetch update error, fetching from contract");
        return getContractState(proposalInfo);
      }

      if (!latestMaxLtAfterTx) {
        Logger("fetching from server");
        return server.getState();
      }
      const serverMaxLt = await server.getMaxLt();

      if (Number(serverMaxLt) >= Number(latestMaxLtAfterTx || "0")) {
        Logger(
          `server is up to date, fetching from server matLt:${serverMaxLt} currentMaxLt:${latestMaxLtAfterTx}`
        );
        updateMaxLtAfterTx(undefined);

        return server.getState();
      }

      Logger(
        `server is outdated, server maxLt:${serverMaxLt}, currentMaxLt:${latestMaxLtAfterTx}`
      );
      return contract.getStateUntilMaxLt(proposalId, latestMaxLtAfterTx);
    },
    {
      onError: () => setEndpointError(true),
      refetchInterval: !voteFinished ? STATE_REFETCH_INTERVAL : undefined,
      staleTime: voteFinished ? Infinity : 2_000,
    }
  );
};

const useGetProposalState = () => {
  const queryClient = useQueryClient();
  const queryKey = useQueryKeyWithParams(QueryKeys.STATE);

  return () => {
    return queryClient.getQueryData(queryKey) as ProposalState | undefined;
  };
};

const useUpdateProposalState = () => {
  const queryClient = useQueryClient();
  const queryKey = useQueryKeyWithParams(QueryKeys.STATE);

  return (newData: ProposalState) => {
    queryClient.setQueryData<ProposalState | undefined>(queryKey, (oldData) => {
      return oldData ? { ...oldData, ...newData } : newData;
    });
  };
};

export const useProposalInfoQuery = () => {
  const queryKey = useQueryKeyWithParams(QueryKeys.PROPOSAL_INFO);
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
      const { allTxns, maxLt } = await contract.getTransactions(proposalId);
      const state = await contract.getState(
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

export const useProposalStatus = () => {
  const { data: info } = useProposalInfoQuery();
  const queryKey = useQueryKeyWithParams(QueryKeys.PROPOSAL_TIMELINE);

  const query =  useQuery(
    queryKey,
    () => {
      if (!info) return null;
      return  getProposalStatus(
        Number(info.startTime),
        Number(info.endTime)
      );
    },
    {
      enabled: !!info,
      refetchInterval: 1_000,
    }
  );

  return query.data as ProposalStatus | null
};

const useQueryKeyWithParams = (key: string): QueryKey => {
  const daoId = useDaoId();
  const daoProposalId = useProposalId();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();
  return [key, daoId, daoProposalId, clientV2Endpoint, clientV4Endpoint];
};

export const useLatestMaxLtAfterTx = () => {
  const { latestMaxLtAfterTx, setLatestMaxLtAfterTx } = useAppPersistedStore();

  const daoProposalId = useProposalId();
  return {
    latestMaxLtAfterTx: latestMaxLtAfterTx[daoProposalId],
    updateMaxLtAfterTx: (value?: string) =>
      setLatestMaxLtAfterTx(daoProposalId, value),
  };
};

export const useVote = () => {
  const query = useSendTransaction();
  const { mutate: onFinished } = useOnVoteCallback();
  const contractAddress = useProposalId();

  const mutate = (vote: string) => {
    const args = {
      analytics: {
        submitted: () => analytics.GA.txSubmitted(vote),
        success: () => analytics.GA.txCompleted(vote),
        error: (error: string) => analytics.GA.txFailed(vote, error),
      },
      onFinished,
      message: vote,
      contractAddress,
    };
    query.mutate(args);
  };

  return {
    ...query,
    mutate,
  };
};
