import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "api";
import { LAST_FETCH_UPDATE_LIMIT, STATE_REFETCH_INTERVAL } from "config";
import {
  getAllVotes,
  getCurrentResults,
  getProposalInfo,
  getTransactions,
  getVotingPower,
} from "contracts-api/logic";
import _ from "lodash";
import moment from "moment";
import {
  useClient,
  useSetEndpointPopup,
  useMaxLtStore,
  useDataUpdaterStore,
  usePersistedStore,
} from "store";
import { fromNano } from "ton";
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
} from "types";

export const useGetTransactionsQuery = () => {
  const { clientV2 } = useClient();
  const { toggleError } = useSetEndpointPopup();
  const { refetch: refetchStateQuery } = useStateQuery();
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
        refetchStateQuery();
      }

      return result;
    },
    {
      staleTime: Infinity,
      enabled: false,
      onError: () => {
        toggleError(true);
      },
      onSuccess: (data) => {
        setMaxLt(data.maxLt);
      },
    }
  );
};

export const useStateQuery = () => {
  const queryClient = useQueryClient();
  const { clientV2, clientV4 } = useClient();
  const { toggleError } = useSetEndpointPopup();
  const { getList } = useTransactionsList();
  const { getData } = useStateData();
  const { serverDisabled } = usePersistedStore();

  return useQuery(
    [QueryKeys.STATE],
    async (): Promise<GetState | undefined> => {
      let rawVotes: RawVotes = {};
      let proposalResults: Results | undefined = undefined;
      let votingPower: VotingPower = {};
      // get from server
      if (!serverDisabled) {
        console.log('fetching from server');
        
        const state = await api.getState();
        rawVotes = state.votes;
        proposalResults = state.proposalResults;
        votingPower = state.votingPower;
      }
      // get from contract
      else {

         console.log("fetching from contract");
        const transactions = getList();

        const proposalInfo = await queryClient.ensureQueryData({
          queryKey: [QueryKeys.PROPOSAL_INFO],
          queryFn: () => getProposalInfo(clientV2, clientV4),
        });

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
      const votes: Vote[] = _.map(rawVotes, (v: RawVote, key: string) => {
        const _votingPower = votingPower[key];
        return {
          address: key,
          vote: v.vote,
          votingPower: _votingPower ? fromNano(_votingPower) : "0",
          timestamp: v.timestamp,
        };
      });

      return {
        votes: _.orderBy(votes, "timestamp", ["desc", "asc"]),
        proposalResults: proposalResults,
        votingPower,
      };
    },
    {
      onError: () => {
        if (serverDisabled) toggleError(true);
      },
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: false,
    }
  );
};

export const useProposalInfoQuery = () => {
  const { serverDisabled } = usePersistedStore();
  const { clientV2, clientV4 } = useClient();

  return useQuery(
    [QueryKeys.PROPOSAL_INFO],
    async () => {
      if (!serverDisabled) {
        return api.getProposalInfo();
      }
      return getProposalInfo(clientV2, clientV4);
    },
    {
      staleTime: Infinity,
      enabled: !!clientV2 && !!clientV4,
    }
  );
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

export const useStateUpdateQuery = () => {
  const { setStateUpdateTime, stateUpdateTime} =
    useDataUpdaterStore();
    const { disableServer, serverDisabled } = usePersistedStore();
  const { refetch: getState } = useStateQuery();
  const { clientV2, clientV4 } = useClient();
  const { refetch: runGetTransactionsQuery } = useGetTransactionsQuery();

  return useQuery(
    [QueryKeys.SERVER_STATE_UPDATER],
    async () => {
      if (serverDisabled) {
        runGetTransactionsQuery();
        return "";
      }
      const newStateUpdateTime = await api.getStateUpdateTime();
      const lastFetchUpdate = await api.getLastFetchUpdate();

      // if time between now and last fetch time is greater than 90 seconds, disable server
      if (moment().valueOf() - lastFetchUpdate > LAST_FETCH_UPDATE_LIMIT) {
        disableServer();
        runGetTransactionsQuery();
        return "";
      }
      // if new state update time is not equal to prev state update time, trigger fetch from server
      if (stateUpdateTime !== newStateUpdateTime) {
        getState();
        setStateUpdateTime(newStateUpdateTime);
      }
      return "";
    },
    {
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4,
    }
  );
};

export const useResetQueries = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.resetQueries();
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
