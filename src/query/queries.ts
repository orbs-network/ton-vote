import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKeys } from "config";
import { api, getDao, getDaos } from "lib";
import { Dao, ProposalStatus } from "types";
import _ from "lodash";
import { ProposalMetadata } from "ton-vote-sdk";
import { getProposalStatus, Logger } from "utils";

export const useDaosQuery = () => {
  return useInfiniteQuery({
    queryKey: [QueryKeys.DAOS],
    queryFn: async ({ pageParam, signal }) => {
      const nextPage = pageParam ? Number(pageParam) : undefined;

      return getDaos(nextPage, signal);
    },
    staleTime: Infinity,
    getNextPageParam: (lastPage) =>
      lastPage.nextId === -1 ? undefined : lastPage.nextId,
  });
};

type DaosQueryType = {
  pageParams: Array<number | undefined>;
  pages: Array<{ daos: Dao[]; nextId: number }>;
};

export const useDaoQuery = (daoAddress: string) => {
  const queryClient = useQueryClient();

  return useQuery([QueryKeys.DAO, daoAddress], ({ signal }) => {
    const daosQuery = queryClient.getQueryData([
      QueryKeys.DAOS,
    ]) as DaosQueryType;

    const daos = _.flatten(daosQuery?.pages.map((it) => it.daos));
    const cachedDao = _.find(daos, (it) => it.daoAddress === daoAddress);
    if (cachedDao) {
      Logger("Fetching dao from cache");
      return cachedDao;
    }
    return getDao(daoAddress, signal);
  }, {
    staleTime: Infinity
  });
};

export const useProposalQuery = (
  proposalAddress?: string,
  enabled?: boolean
) => {
  return useQuery(
    [QueryKeys.PROPOSAL, proposalAddress],
    async ({ signal }) => {
      
      return api.getProposal(proposalAddress!, signal);
    },
    {
      enabled: !!proposalAddress && !!enabled,
    }
  );
};

export const useProposalStatusQuery = (
  proposalMetadata?: ProposalMetadata,
  proposalAddress?: string
) => {
  const query = useQuery(
    [QueryKeys.PROPOSAL_TIMELINE, proposalAddress],
    () => getProposalStatus(proposalMetadata!),
    {
      refetchInterval: 1_000,
      enabled: !!proposalMetadata && !!proposalAddress,
    }
  );

  return query.data as ProposalStatus | null;
};
