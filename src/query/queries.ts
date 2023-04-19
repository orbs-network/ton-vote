import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKeys } from "config";
import { api, getDao, getDaos } from "lib";
import { Dao, Proposal, ProposalStatus } from "types";
import _ from "lodash";
import {
  getClientV2,
  getClientV4,
  getDaoMetadata,
  getDaoProposals,
  getDaoRoles,
  getProposalMetadata,
  ProposalMetadata,
  ProposalResult,
} from "ton-vote-sdk";
import { getProposalStatus, Logger } from "utils";
import { OLD_DAO, proposals } from "data";
import { useNewDataStore } from "store";

export const useDaosQuery = () => {
  const { daos: newDaosAddresses, removeDao } = useNewDataStore();


  return useQuery([QueryKeys.DAOS], async ({ signal }) => {
    const daos = (await getDaos(signal)) || [];    

  

    if (!_.size(newDaosAddresses)) {
      return daos;
    }
    const addresses = _.map(daos, (it) => it.daoAddress);
    const client = await getClientV2();

    let newDaosMap: Array<Dao | undefined> = await Promise.all(
      _.map(newDaosAddresses, async (newDaoAddress) => {
        if (addresses.includes(newDaoAddress)) {
          
          removeDao(newDaoAddress);
        } else {
          Logger(`New DAO: ${newDaoAddress}`)
          return {
            daoAddress: newDaoAddress,
            daoMetadata: await getDaoMetadata(client, newDaoAddress),
            daoRoles: await getDaoRoles(client, newDaoAddress),
            daoProposals:
              (await getDaoProposals(client, newDaoAddress))
                .proposalAddresses || [],
          };
        }
      })
    );

    const newDaos = _.compact(newDaosMap);

    return [...newDaos, ...daos];
  }, {
    refetchInterval: 10_000
  });
};

const useHandleNewProposals = () => {
  const { proposals: newProposals, removeProposal } = useNewDataStore();

  return (daoAddress: string, proposals: string[]) => {
    const newDaoPoposals = newProposals[daoAddress];

    // if no new proposals reutrn current proposals
    if (!_.size(newDaoPoposals)) return proposals;
    _.forEach(newDaoPoposals, (newDaoProposal) => {
      // if server already return new proposal, delete from local storage
      if (proposals.includes(newDaoProposal)) {
        removeProposal(daoAddress, newDaoProposal);
      } else {
        // if server dont return new proposal, add to proposals
        proposals.push(newDaoProposal);
      }
    });

    return _.uniq(proposals);
  };
};

export const useDaoQuery = (daoAddress: string, refetchInterval?: number) => {
  const queryClient = useQueryClient();

  const handleProposal = useHandleNewProposals();

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
      const daoProposals = handleProposal(daoAddress, dao.daoProposals);

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
