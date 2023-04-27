import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "config";
import { Dao, Proposal, ProposalResults, ProposalStatus } from "types";
import _ from "lodash";
import {
  getClientV2,
  getClientV4,
  getDaoMetadata,
  getDaoProposals,
  getDaoRoles,
  getProposalMetadata,
  ProposalMetadata,
  getSingleVoterPower
} from "ton-vote-contracts-sdk";
import { getProposalStatus, Logger } from "utils";
import { OLD_DAO, proposals } from "data/data";
import { useNewDataStore } from "store";
import { showPromiseToast } from "toasts";
import { lib } from "lib/lib";
import { api } from "api";

export const useDaosQuery = (refetchInterval?: number) => {
  const { daos: newDaosAddresses, removeDao } = useNewDataStore();

  return useQuery(
    [QueryKeys.DAOS],
    async ({ signal }) => {
      const res = (await lib.getDaos(signal)) || [];
      const daos = [OLD_DAO, ...res];
      
      if (!_.size(newDaosAddresses)) {
        return daos;
      }
      const addresses = _.map(daos, (it) => it.daoAddress);
      const client = await getClientV2();

      let promise: Promise<Array<Dao | undefined>> = Promise.all(
        _.map(newDaosAddresses, async (newDaoAddress) => {
          if (addresses.includes(newDaoAddress)) {
            removeDao(newDaoAddress);
          } else {
            Logger(`New DAO: ${newDaoAddress}`);

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

      // showPromiseToast({
      //   promise: promise,
      //   loading: "Updating Spaces",
      //   success: "Spaces updated",
      // });

      const newDaosMap = await promise;

      const newDaos = _.compact(newDaosMap);

      daos.splice(1, 0, ...newDaos);

      return daos;
    },
    {
      refetchInterval,
    }
  );
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

export const useDaoQuery = (
  daoAddress: string,
  refetchInterval?: number,
  staleTime: number = Infinity
) => {
  const handleProposal = useHandleNewProposals();
  const queryClient = useQueryClient();

  return useQuery(
    [QueryKeys.DAO, daoAddress],
    async ({ signal }) => {
      if (daoAddress === OLD_DAO.daoAddress) {
        return OLD_DAO;
      }

      const dao = await lib.getDao(daoAddress, signal);
      const daoProposals = handleProposal(daoAddress, dao.daoProposals);

      return {
        ...dao,
        daoProposals,
      };
    },
    {
      staleTime,
      refetchInterval,
      initialData: () => {
        const daos = queryClient.getQueryData<Dao[]>([QueryKeys.DAOS]);
        if (!daos) return;
        return daos.find((it) => it.daoAddress === daoAddress);
      },
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
          proposalResult: {} as ProposalResults,
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

