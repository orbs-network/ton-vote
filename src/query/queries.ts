import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DAO_REFETCH_INTERVAL, QueryKeys } from "config";
import { api, getDao, getDaos } from "lib";
import { Dao, Proposal, ProposalStatus } from "types";
import _ from "lodash";
import {
  getClientV2,
  getClientV4,
  getProposalMetadata,
  ProposalMetadata,
  ProposalResult,
} from "ton-vote-sdk";
import { getProposalStatus, Logger } from "utils";
import { OLD_DAO, proposals } from "data";
import { useProposlFromLocalStorage } from "store";

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

const handleProposal = (proposals: string[], localStorageProposal?: string) => {
  if (!localStorageProposal) return proposals;
  if (proposals.includes(localStorageProposal)) return proposals;
  return [localStorageProposal, ...proposals];
};

export const useDaoQuery = (daoAddress: string, refetchInterval?: number) => {
  const queryClient = useQueryClient();
  const { proposals: localStorageProposals } = useProposlFromLocalStorage();

  return useQuery(
    [QueryKeys.DAO, daoAddress],
    async ({ signal }) => {
      if (daoAddress === OLD_DAO.daoAddress) {
        return OLD_DAO;
      }
      const daosQuery = queryClient.getQueryData([QueryKeys.DAOS]) as Dao[];

      const cachedDao = _.find(daosQuery, (it) => it.daoAddress === daoAddress);
      if (cachedDao) {
        Logger("Fetching dao from cache");
      }
      const dao = cachedDao || (await getDao(daoAddress, signal));
      const daoProposals = handleProposal(
        dao.daoProposals,
        localStorageProposals[daoAddress]
      );
      console.log({ daoProposals });

      return {
        ...dao,
        daoProposals,
      };
    },
    {
      staleTime: 5_000,
      refetchInterval,
    }
  );
};

export const useProposalQuery = (proposalAddress?: string) => {
  return useQuery<Proposal>(
    [QueryKeys.PROPOSAL, proposalAddress],
    async ({ signal }) => {
      try {
        const p = proposals[proposalAddress!];
        const proposal = p || (await api.getProposal(proposalAddress!, signal));
        if (_.isEmpty(proposal.metadata)) {
          throw new Error("Proposal not found is server");
        }
        return proposal;
      } catch (error) {
        Logger("Proposal not found is server, fetching from contract");
        const clientV2 = await getClientV2();
        const clientV4 = await getClientV4();
        return {
          votes: [],
          proposalResult: {} as ProposalResult,
          metadata: await getProposalMetadata(
            clientV2,
            clientV4,
            proposalAddress!
          ),
        };
      }
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
