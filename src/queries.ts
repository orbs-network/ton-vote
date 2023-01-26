import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAllVotes,
  getClientV2,
  getClientV4,
  getCurrentResults,
  getProposalInfo,
  getTransactions,
  getVotingPower,
} from "contracts-api/main";
import _ from "lodash";
import { useClient, useClient4 } from "store/wallet-store";

enum QueryKeys {
  TRANSACTIONS = "TRANSACTIONS",
  VOTING_POWER = "VOTING_POWER",
  PROPOSAL_INFO = "PROPOSAL_INFO",
  CURRENT_RESULTS = "CURRENT_RESULTS",
  GET_ALL_VOTES = "GET_ALL_VOTES",
}

export const useTransactionsQuery = () => {
  const { client } = useClient();
  const { client4 } = useClient4();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery(
    [QueryKeys.TRANSACTIONS],
    async ({ pageParam = undefined }) => {
      return  getTransactions(client, pageParam);
    },
    {
      staleTime: Infinity,
      getNextPageParam: (lastPage) => lastPage?.paging,
      onSuccess: async (res) => {
        
        const pages = (
          queryClient.getQueryData([QueryKeys.TRANSACTIONS]) as any
        ).pages;

        const onlyTxs = pages.map((it: any) => it.allTxns);
        const transactions = [...new Set(onlyTxs.flat())];
        const proposalInfo = await queryClient.ensureQueryData({
          queryKey: [QueryKeys.PROPOSAL_INFO],
          queryFn: () => getProposalInfo(client),
        });

        const prevVotingPower = queryClient.getQueryData([
          QueryKeys.VOTING_POWER,
        ]);

        const votingPower = await getVotingPower(
          client4,
          proposalInfo,
          transactions,
          prevVotingPower as any
        );

        let currentResults = getCurrentResults(
          transactions,
          votingPower,
          proposalInfo
        );
    
          
        const allVotes = getAllVotes(transactions, proposalInfo);

        queryClient.setQueryData([QueryKeys.GET_ALL_VOTES], allVotes);
        queryClient.setQueryData([QueryKeys.CURRENT_RESULTS], currentResults);
        queryClient.setQueryData([QueryKeys.VOTING_POWER], votingPower);

        queryClient.setQueryData([QueryKeys.TRANSACTIONS], (prev: any) => {
          return {
            ...prev,
            transactions,
          };
        });
      },
    }
  );

  return {
    ...query,
    data: (queryClient.getQueryData([QueryKeys.TRANSACTIONS]) as any)
      ?.transactions,
  };
};

// refetch new transaction on app load and every x seconds
export const useTransactionsRefetchQuery = () => {
  const { isLoading, fetchNextPage } = useTransactionsQuery();
  const { client } = useClient();

  return useQuery(
    ["useTransactionsRefetchQuery"],
    () => {
      return fetchNextPage();
    },
    {
      enabled: !isLoading && !!client,
      refetchInterval: 30_000,
    }
  );
};

export const useClientV2Query = () => {
  const { setClient } = useClient();
  useQuery(["useClientV2Query"], async () => {
    setClient(await getClientV2());
    return "";
  });
};

export const useClientV4Query = () => {
  const { setClient4 } = useClient4();

  useQuery(["useClientV4Query"], async () => {
    setClient4(await getClientV4());
    return "";
  });
};

export const useVotingPowerQuery = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData([QueryKeys.VOTING_POWER]);
};

export const useProposalInfoQuery = () => {
  const { client } = useClient();
  return useQuery(["useProposalInfoQuery"], () => getProposalInfo(client), {
    enabled: !!client,
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};

export const useCurrentResultsQuery = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData([
    QueryKeys.CURRENT_RESULTS,
  ]) as ReturnType<typeof getCurrentResults> | undefined;
};

export const useAllVotesQuery = () => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData([QueryKeys.GET_ALL_VOTES]) as ReturnType<typeof getAllVotes> | undefined;
};
