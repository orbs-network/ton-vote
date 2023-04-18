import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DAO_REFETCH_INTERVAL, QueryKeys } from "config";
import { api, getDao, getDaos } from "lib";
import { Dao, ProposalStatus } from "types";
import _ from "lodash";
import { ProposalMetadata } from "ton-vote-sdk";
import { getProposalStatus, Logger } from "utils";
import { OLD_DAO, proposals } from "data";

export const useDaosQuery = () => {
  return useQuery(
    [QueryKeys.DAOS],
    ({ signal }) => {
      return getDaos(signal);
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useDaoQuery = (
  daoAddress: string,
  refetchInterval?: number
) => {
  const queryClient = useQueryClient();

  return useQuery(
    [QueryKeys.DAO, daoAddress],
    ({ signal }) => {
      if (daoAddress === OLD_DAO.daoAddress) {
        return OLD_DAO;
      }
      const daosQuery = queryClient.getQueryData([QueryKeys.DAOS]) as Dao[];

      const cachedDao = _.find(daosQuery, (it) => it.daoAddress === daoAddress);
      if (cachedDao) {
        Logger("Fetching dao from cache");
        return cachedDao;
      }
      return getDao(daoAddress, signal);
    },
    {
      staleTime: 5_000,
      refetchInterval,
    }
  );
};

export const useProposalQuery = (proposalAddress?: string) => {
  return useQuery(
    [QueryKeys.PROPOSAL, proposalAddress],
    async ({ signal }) => {
      const p = proposals[proposalAddress!];
      return p || api.getProposal(proposalAddress!, signal);
    },
    {
      enabled: !!proposalAddress,
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
