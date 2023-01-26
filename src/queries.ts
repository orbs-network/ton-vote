import {
  useInfiniteQuery,
  useMutation,
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
import { useEffect } from "react";
import { useClient, useClient4 } from "store/client-store";
import { useConnection } from "store/wallet-store";
import { beginCell, toNano } from "ton";
import { votingContract } from "./contracts-api/main";

enum QueryKeys {
  TRANSACTIONS = "TRANSACTIONS",
  VOTING_POWER = "VOTING_POWER",
  PROPOSAL_INFO = "PROPOSAL_INFO",
  CURRENT_RESULTS = "CURRENT_RESULTS",
  GET_ALL_VOTES = "GET_ALL_VOTES",
}

export const useTransactionsTest = () => {
  useEffect(() => {
    async () => {
      const res = await getTransactions();
      console.log(res);
    };
  }, []);
};


export const useTransactionsQuery = () => {
  const { client } = useClient();
  const { client4 } = useClient4();
  const queryClient = useQueryClient();

  return useQuery(
    [QueryKeys.TRANSACTIONS],
    async ({ pageParam = undefined }) => {
      const result = await getTransactions(client, pageParam);

      if (result.allTxns.length) {
      
        const onlyTxs = result.allTxns;
        const transactions = _.flatten(onlyTxs);
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

        const currentResults = getCurrentResults(
          transactions,
          votingPower,
          proposalInfo
        );

        const allVotes = getAllVotes(transactions, proposalInfo);

        queryClient.setQueryData([QueryKeys.GET_ALL_VOTES], allVotes);
        queryClient.setQueryData([QueryKeys.CURRENT_RESULTS], currentResults);
        queryClient.setQueryData([QueryKeys.VOTING_POWER], votingPower);
      }
      return result;
    },
    {
      staleTime: Infinity,
    }
  );
};

// refetch new transaction on app load and every x seconds
export const useTransactionsRefetchQuery = () => {
  const { isLoading, refetch } = useTransactionsQuery();
  const { client } = useClient();

  return useQuery(
    ["useTransactionsRefetchQuery"],
    () => {
      return refetch();
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
  return queryClient.getQueryData([QueryKeys.CURRENT_RESULTS]) as
    | ReturnType<typeof getCurrentResults>
    | undefined;
};

export const useAllVotesQuery = () => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData([QueryKeys.GET_ALL_VOTES]) as
    | ReturnType<typeof getAllVotes>
    | undefined;
};

//   to: Address;
//     value: BN;
//     stateInit?: StateInit;
//     message?: Cell;

export const useSendTransaction = () => {
  const connection = useConnection();
  const { refetch } = useTransactionsRefetchQuery();

  return useMutation(async ({ value }: { value: "yes" | "no" | "abstain" }) => {
    // const waiter = await waitForSeqno(
    //   client!.openWalletFromAddress({
    //     source: Address.parse(walletAddress!!),
    //   })
    // );

    // const onSuccess = async () => {
    //   await waiter();
    //   // handle success
    // }
    const cell = beginCell();

    console.log(value, "SHAHAR*(*(");

    switch (value) {
      case "yes":
        cell.storeUint(121, 8);
        break;
      case "no":
        cell.storeUint(110, 8);
        break;
      case "abstain":
        cell.storeUint(97, 8);
        break;
      default:
        throw new Error("unknown option");
    }

    const c = cell.endCell();

    return connection.requestTransaction(
      {
        to: votingContract,
        value: toNano("0.01"),
        message: c,
      },
      refetch
    );
  });
};
