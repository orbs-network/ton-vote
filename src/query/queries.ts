import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKeys } from "config";
import { api } from "lib";
import { Dao, DaoMetadata, ProposalStatus } from "types";
import _ from "lodash";
import { useEnpointsStore } from "store";
import { getClientV2, getClientV4 } from "ton-vote-sdk";
import * as TonVoteSDK from "ton-vote-sdk";

export const useDaosQuery = () => {
  return useInfiniteQuery({
    queryKey: [QueryKeys.DAOS],
    queryFn: async ({ pageParam, signal }) => {
      console.log({ pageParam });

      const nextPage = pageParam ? Number(pageParam) : undefined;

      return api.getDaos(nextPage, signal);
    },
    staleTime: Infinity,
    getNextPageParam: (lastPage) => lastPage.nextId,
  });
};

export const useDaoQuery = (daoAddress: string, enabled?: boolean) => {
  const queryClient = useQueryClient();
  const clients = useClientsQuery();
  const { fetchNextPage } = useDaosQuery();

  return useQuery(
    [QueryKeys.DAO_METADATA, daoAddress],
    async () => {
      type DaosQueryType = {
        pageParams: Array<number | undefined>;
        pages: Array<{ daos: Dao[]; nextId: number }>;
      };

      const daosQuery = queryClient.getQueryData([
        QueryKeys.DAOS,
      ]) as DaosQueryType;

      const daos = _.flatten(daosQuery?.pages.map((it) => it.daos));
      const cachedDao = _.find(daos, (it) => it.address === daoAddress);
      if (cachedDao) {
        return cachedDao;
      }

      try {
        // const daoFromApi = await api.getDao(daoAddress);
        // if (daoFromApi) return daoFromApi;
        throw new Error('Not found')
      } catch (error) {
        const daoFromContract = {
          address: daoAddress,
          roles: await TonVoteSDK.getDaoRoles(clients!.clientV2, daoAddress),
          daoMetadata: await TonVoteSDK.getDaoMetadata(
            clients!.clientV2,
            daoAddress
          ),
        };

        // adding to list of daos
        queryClient.setQueryData(
          [QueryKeys.DAOS],
          (prevData: DaosQueryType | undefined) => {
            if (!prevData) {
              return {
                pageParams: [undefined],
                pages: [
                  {
                    daos: [daoFromContract],
                    nextId: 0,
                  },
                ],
              };
            } else {
              _.first(prevData.pages)?.daos.unshift(daoFromContract);
            }
            return prevData;
          }
        );

        fetchNextPage();

        return daoFromContract;
      }
    },
    {
      enabled: !!clients?.clientV2 && !!enabled,
    }
  );
};

export const useAddDao = () => {
  const queryClient = useQueryClient();

  return (daoAddress: string) => {
    const daos = queryClient.getQueryData([QueryKeys.DAOS]) as any;

    if (!daos) return;

    daos.pages[0].daoAddresses.unshift(daoAddress);
    queryClient.setQueryData([QueryKeys.DAOS], daos);
  };
};

export const useDaoProposalsQuery = (daoAddress: string) => {
  return useInfiniteQuery({
    queryKey: [QueryKeys.PROPOSALS, daoAddress],
    queryFn: async ({ pageParam, signal }) => {
      const nextPage = pageParam ? Number(pageParam) : undefined;

      return api.getProposals(daoAddress, nextPage, signal);
    },
    enabled: !!daoAddress,
    getNextPageParam: (lastPage) => lastPage.nextId,
  });
};

export const useProposalStatusQuery = (
  proposalAddress: string,
  refetchInterval?: number
) => {
  const query = useQuery(
    [QueryKeys.PROPOSAL_TIMELINE, proposalAddress],
    async () => {
      return {} as any;
    },
    {
      refetchInterval: refetchInterval,
    }
  );

  return query.data as ProposalStatus | null;
};

export const useServerLastFetchUpdateValidationQuery = () => {
  return useQuery(
    [QueryKeys.SERVER_VALIDATION],
    ({ signal }) => api.validateServerLastUpdate(signal),
    {
      refetchInterval: 20_000,
    }
  );
};

export const useClientsQuery = () => {
  const { clientV2Endpoint, clientV4Endpoint, apiKey } = useEnpointsStore();
  const query = useQuery(
    ["useClientsQuery", clientV2Endpoint, clientV4Endpoint],
    async () => {
      return {
        clientV2: await getClientV2(clientV2Endpoint, apiKey),
        clientV4: await getClientV4(clientV4Endpoint || ""),
      };
    }
  );

  return query.data;
};
