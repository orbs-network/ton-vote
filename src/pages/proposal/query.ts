import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  voteOptions,
} from "config";
import { useConnectionStore, useGetTransaction } from "connection";
import {
  filterTxByTimestamp,
  getProposalInfo,
  getTransactions,
} from "contracts-api/logic";
import { useGetContractState, useProposalId, useSpaceId } from "hooks";
import _ from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  useEnpointModalStore,
  useAppPersistedStore,
  useIsCustomEnpoint,
} from "store";
import { Address } from "ton";
import {
  QueryKeys,
  GetTransactionsPayload,
  GetState,
  ProposalInfo,
  Proposal,
  Space,
  Vote,
} from "types";
import { getProposalStatus, Logger, parseVotes, waitForSeqno } from "utils";
import {
  useProposalPersistStore,
  useProposalStore,
  useVoteStore,
} from "./store";

const useGetServerStateCallback = () => {
  const { serverUpdateTime, setServerUpdateTime, setServerMaxLt } =
    useProposalStore();
  const handleWalletVote = useWalletVote();
  const queryClient = useQueryClient();
  const queryKey = useQueryKey(QueryKeys.PROPOSAL_INFO);

  return async () => {
    Logger("Fetching from server");
    const newStateUpdateTime = await api.getStateUpdateTime();
    // if new state update time is not equal to prev state update time, trigger fetch from server
    // if (serverUpdateTime === newStateUpdateTime) {
    //   return;
    // }

    setServerUpdateTime(newStateUpdateTime);
    const state = await api.getState();

    setServerMaxLt(state.maxLt);

    await queryClient.ensureQueryData({
      queryKey,
      queryFn: api.getProposalInfo,
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
    useProposalStore();
  const { clientV2, clientV4 } = useConnectionStore();
  const queryClient = useQueryClient();
  const getContractState = useGetContractState();
  const getStateData = useDataFromQueryClient().getStateData;
  const handleWalletVote = useWalletVote();
  const queryKey = useQueryKey(QueryKeys.PROPOSAL_INFO);

  return async () => {
    Logger("Fetching from contract");
    const result: GetTransactionsPayload = await getTransactions(
      CONTRACT_ADDRESS,
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
      queryKey,
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

// we use this in case that user did refresh after sending tx,
// and have minMaxLt in the persisted store, and the server is outdated
const useGetStatewhileServerOutdated = () => {
  const getContractState = useGetContractState();
  const { getStateData } = useDataFromQueryClient();
  const queryClient = useQueryClient();
  const { clientV2, clientV4 } = useConnectionStore();
  const { maxLt } = useProposalPersistStore();
  const handleWalletVote = useWalletVote();
  const setServerMaxLt = useProposalStore().setServerMaxLt;
  const queryKey = useQueryKey(QueryKeys.PROPOSAL_INFO);

  return async () => {
    const state = getStateData();
    if (state) return state;
    const proposalInfo = await queryClient.ensureQueryData({
      queryKey,
      queryFn: () => getProposalInfo(clientV2, clientV4),
    });
    const transactions = (await getTransactions(CONTRACT_ADDRESS, clientV2))
      .allTxns;
    const filtered = filterTxByTimestamp(transactions, maxLt);
    const result = await getContractState(proposalInfo, filtered);
    setServerMaxLt(maxLt);
    return {
      ...result,
      votes: handleWalletVote(result.votes),
    };
  };
};

export const useStateQuery = () => {
  const { clientV2, clientV4 } = useConnectionStore();
  const { setEndpointError } = useEnpointModalStore();
  const isCustomEnpoint = useIsCustomEnpoint()
  
  const { getStateData: getStateCurrentData } = useDataFromQueryClient();
  const { maxLt: minServerMaxLt, clearMaxLt } = useProposalPersistStore();
  const txLoading = useProposalStore().txLoading;
  const checkServerHealth = useCheckServerhealth();
  const getStatewhileServerOutdatedAndStateEmpty =
    useGetStatewhileServerOutdated();
  const getServerStateCallback = useGetServerStateCallback();
  const getContractStateCallback = useGetContractStateCallback();

  console.log({ isCustomEnpoint });
  

  const queryKey = useQueryKey(QueryKeys.STATE);

  return useQuery(
    queryKey,
    async () => {
      const onServerState = async () => {
        const data = await getServerStateCallback();
        return data || getStateCurrentData();
      };

      const onContractState = async () => {
        const data = await getContractStateCallback();
        return data || getStateCurrentData();
      };

      if (isCustomEnpoint) {
        return onContractState();
      }

      const isSrverError = await checkServerHealth();

      if (isSrverError) {
        Logger("server error, fetching from contract");

        return onContractState();
      }

      if (!minServerMaxLt) {
        return onServerState();
      }
      const serverMaxLt = await api.getMaxLt();

      if (Number(serverMaxLt) >= Number(minServerMaxLt || "0")) {
        Logger(
          `server is up to date, fetching from server matLt:${serverMaxLt} currentMaxLt:${minServerMaxLt}`
        );
        clearMaxLt();

        return onServerState();
      }

      Logger(
        `server is outdated, server maxLt:${serverMaxLt} currentMaxLt:${minServerMaxLt}`
      );
      return (
        getStateCurrentData() || getStatewhileServerOutdatedAndStateEmpty()
      );
    },
    {
      onError: () => {
        setEndpointError(true);
      },
      refetchInterval: STATE_REFETCH_INTERVAL,
      enabled: !!clientV2 && !!clientV4 && !txLoading,
      //   staleTime: Infinity,
    }
  );
};

export const useDataFromQueryClient = () => {
  const queryClient = useQueryClient();
  const queryKey = useQueryKey(QueryKeys.STATE);

  const getStateData = (): GetState | undefined => {
    return queryClient.getQueryData(queryKey);
  };

  const setStateData = (newData: GetState) => {
    queryClient.setQueryData<GetState | undefined>(queryKey, (oldData) => {
      return oldData ? { ...oldData, ...newData } : newData;
    });
  };

  return {
    getStateData,
    setStateData,
  };
};

export const useProposalInfoQuery = () => {
  const queryKey = useQueryKey(QueryKeys.PROPOSAL_INFO);
  return useQuery<ProposalInfo | undefined>(queryKey, {
    staleTime: Infinity,
    enabled: false,
  });
};

const useOnVoteCallback = () => {
  const getContractState = useGetContractState();
  const proposalInfo = useProposalInfoQuery().data;
  const clientV2 = useConnectionStore().clientV2;
  const { setStateData, getStateData } = useDataFromQueryClient();
  const { setMaxLt } = useProposalPersistStore();

  return useMutation(
    async () => {
      Logger("fetching data from contract after transaction");
      const transactions = await getTransactions(CONTRACT_ADDRESS, clientV2);
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
  const { address } = useConnectionStore();
  const clientV2 = useConnectionStore().clientV2;
  const [txApproved, setTxApproved] = useState(false);
  const { mutateAsync: onVoteFinished } = useOnVoteCallback();
  const { showNotification } = useNotification();
  const { txLoading, setTxLoading } = useProposalStore();
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

const createSpaces = (amount: number): Space[] => {
  return _.range(0, amount).map((it, i) => {
    return {
      name: `spaces ${i++}`,
      image: `https://picsum.photos/id/${i}/200/200`,
      members: i * 50,
      id: `spaces-${i++}`,
    };
  });
};

export const useGetSpacesQuery = () => {
  return useQuery<Space[]>(["useGetSpacesQuery"], () => {
    return createSpaces(100);
  });
};

export const useGetSpaceQuery = (id?: string) => {
  const { data: spaces } = useGetSpacesQuery();
  return useQuery<Space>(
    ["useGetSpaceQuery", id],
    () => {
      return spaces!.find((s) => s.id === id) || ({} as Space);
    },
    {
      enabled: !!spaces && spaces.length > 0 && !!id,
    }
  );
};

const createProposalPeview = (amount: number): Proposal[] => {
  return _.range(0, amount).map((it, i) => {
    return {
      title: `Proposal ${i++}`,
      description: `This is proposal ${i++}`,
      ownerAvatar: `https://picsum.photos/id/${i++}/200/200`,
      ownerAddress: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      contractAddress: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      startDate: moment().subtract(3, "days").unix().valueOf(),
      endDate: moment().add(5, "days").unix().valueOf(),
      id: crypto.randomUUID(),
    };
  });
};

export const useGetSpaceProposals = (spaceId?: string) => {
  return useQuery(
    ["useGetSpaceProposals", spaceId],
    () => {
      return createProposalPeview(100);
    },
    {
      enabled: !!spaceId,
    }
  );
};

export const useWalletVote = () => {
  const { setVote } = useVoteStore();

  return (
    votes: Vote[],
    walletAddress = useConnectionStore.getState().address
  ) => {
    if (!walletAddress) return votes;
    let vote = votes.find((it) => it.address === walletAddress);

    if (!vote) return votes;
    const index = votes.findIndex((it) => it.address === walletAddress);
    votes.splice(index, 1);
    votes.unshift(vote);

    const value = voteOptions.find((it) => it.name === vote?.vote)?.value;
    setVote(value || "");

    return votes;
  };
};

export const useVoteTimeline = () => {
  const { data: info, isLoading } = useProposalInfoQuery();
  const queryKey = useQueryKey(QueryKeys.PROPOSAL_TIMELINE);

  const query = useQuery(
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

  return (
    query.data || {
      voteStarted: false,
      voteEnded: false,
      voteInProgress: false,
      isLoading,
    }
  );
};

export const useWalletAddressListener = () => {
  const { getStateData, setStateData } = useDataFromQueryClient();
  const handleWalletVote = useWalletVote();
  const { address } = useConnectionStore();

  useEffect(() => {
    const data = getStateData();

    if (!data) return;

    data.votes = handleWalletVote(data.votes, address);
    setStateData(data);
  }, [address]);
};

export const useQueryKey = (key: string): QueryKey => {
  const spaceId = useSpaceId();
  const proposalId = useProposalId();
  return [key, spaceId, proposalId];
};
