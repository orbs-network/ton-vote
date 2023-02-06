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
  ProposalInfo,
} from "types";

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

      const getProposalInfoQueryFn = (): Promise<ProposalInfo> => {
        if (serverDisabled) {
          return getProposalInfo(clientV2, clientV4);
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
        rawVotes = state.votes;
        proposalResults = state.proposalResults;
        votingPower = state.votingPower;
      }
      // get from contract
      else {
        console.log("fetching from contract");
        const transactions = getList();
        console.log(transactions, getData()?.votingPower);

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

export const useServerStateUpdateQuery = () => {
  const { setStateUpdateTime, stateUpdateTime } = useDataUpdaterStore();
  const { disableServer, serverDisabled } = usePersistedStore();
  const { refetch: getState } = useStateQuery();
  const { clientV2, clientV4 } = useClient();

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
      enabled: !!clientV2 && !!clientV4 && !serverDisabled,
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

  return useQuery(
    [QueryKeys.CONTRACT_STATE_UPDATER],
    async () => {
      const result: GetTransactionsPayload = await getTransactions(
        clientV2,
        maxLt
      );
      console.log({ maxLt });

      if (result.allTxns.length > 0) {
        addToList(result.allTxns);
        getState();
        setMaxLt(result.maxLt);
      }
      return "";
    },
    {
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4 && serverDisabled,
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
