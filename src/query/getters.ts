import { useQuery, useQueryClient } from "@tanstack/react-query";
import { releaseMode, QueryKeys } from "config";
import { Dao, Proposal, ProposalResults, ProposalStatus } from "types";
import _ from "lodash";
import {
  getClientV2,
  getClientV4,
  getCreateDaoFee,
  getDaoFwdMsgFee,
  getDaoMetadata,
  getDaoProposals,
  getDaoRoles,
  getProposalMetadata,
  getRegistryAdmin,
  getRegistryId,
  getSingleVoterPower,
  ProposalMetadata,
} from "ton-vote-contracts-sdk";
import {
  getProposalStatus,
  getVoteStrategyType,
  isDaoWhitelisted,
  Logger,
  nFormatter,
  validateServerUpdateTime,
} from "utils";
import { OLD_DAO, proposals } from "data/foundation/data";
import { useNewDataStore, useSyncStore } from "store";
import { getDaoFromContract, lib } from "lib/lib";
import { api } from "api";
import { useDaoAddressFromQueryParam } from "hooks";
import { fromNano } from "ton-core";
import { useConnection } from "ConnectionProvider";

export const useDaosQuery = (refetchInterval?: number) => {
  const { daos: newDaosAddresses, removeDao } = useNewDataStore();
  const { getDaoUpdateMillis } = useSyncStore();

  return useQuery(
    [QueryKeys.DAOS],
    async ({ signal }) => {
      const serverLastUpdate = await api.getUpdateTime();
      const res = await Promise.all(
        _.map((await lib.getDaos(signal)) || [], async (dao) => {
          const metadataLastUpdate = getDaoUpdateMillis(dao.daoAddress);
          let metadata = dao.daoMetadata;
          if (
            metadataLastUpdate &&
            !validateServerUpdateTime(serverLastUpdate, metadataLastUpdate)
          ) {
            metadata = await getDaoMetadata(
              await getClientV2(),
              dao.daoAddress
            );
          }
          return {
            ...dao,
            daoMetadata: metadata,
          };
        })
      );

      const daos = [OLD_DAO, ...res];

      if (_.size(newDaosAddresses)) {
        const addresses = _.map(daos, (it) => it.daoAddress);
        const client = await getClientV2();

        let promise = Promise.allSettled(
          _.map(newDaosAddresses, async (newDaoAddress) => {
            if (addresses.includes(newDaoAddress)) {
              removeDao(newDaoAddress);
            } else {
              Logger(`New DAO: ${newDaoAddress}`);

              return getDaoFromContract(newDaoAddress, client);
            }
          })
        );

        const newDaosMap = await promise;

        const newDaos = _.compact(
          newDaosMap.map((it, index) => {
            if (it.status === "fulfilled") {
              return it.value;
            } else {
              removeDao(newDaosAddresses[index]);
            }
          })
        );
        daos.splice(1, 0, ...newDaos);
      }

      return _.filter(daos, (it) => isDaoWhitelisted(it.daoAddress));
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
  daoAddress?: string,
  refetchInterval?: number,
  staleTime: number = Infinity
) => {
  const handleProposal = useHandleNewProposals();
  const queryClient = useQueryClient();
  const isWhitelisted = isDaoWhitelisted(daoAddress);
  const { getDaoUpdateMillis, removeDaoUpdateMillis } = useSyncStore();

  return useQuery(
    [QueryKeys.DAO, daoAddress],
    async ({ signal }) => {
      if (!isWhitelisted) {
        throw new Error("DAO not whitelisted");
      }
      if (daoAddress === OLD_DAO.daoAddress) {
        return OLD_DAO;
      }

      const metadataLastUpdate = getDaoUpdateMillis(daoAddress!);
      let fetchFromContract = false;

      if (metadataLastUpdate) {
        const serverLastUpdate = await api.getUpdateTime();
        if (!validateServerUpdateTime(serverLastUpdate, metadataLastUpdate)) {
          Logger("metadataLastUpdate is not valid in server");
          fetchFromContract = true;
        } else {
          removeDaoUpdateMillis(daoAddress!);
        }
      }

      const dao = await lib.getDao(daoAddress!, fetchFromContract, signal);
      const daoProposals = handleProposal(daoAddress!, dao.daoProposals);

      return {
        ...dao,
        daoProposals,
      };
    },
    {
      retry: isWhitelisted ? 3 : false,
      staleTime,
      refetchInterval: isWhitelisted ? refetchInterval : undefined,
      enabled: !!daoAddress,
      initialData: () => {
        const daos = queryClient.getQueryData<Dao[]>([QueryKeys.DAOS]);
        if (!daos) return;
        return daos.find((it) => it.daoAddress === daoAddress);
      },
    }
  );
};

export const useDaoFromQueryParam = (
  refetchInterval?: number,
  staleTime: number = Infinity
) => {
  const address = useDaoAddressFromQueryParam();
  return useDaoQuery(address, refetchInterval, staleTime);
};

export const useProposalQuery = (proposalAddress?: string) => {
  return useQuery<Proposal>(
    [QueryKeys.PROPOSAL, proposalAddress],
    async ({ signal }) => {
      try {
        const p = proposals[proposalAddress!];
        const proposal = p || (await api.getProposal(proposalAddress!, signal));
        if (_.isEmpty(proposal.metadata)) {
          throw new Error("Proposal not found in server");
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
      staleTime: 30_000,
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

export const useGetDaoFwdMsgFeeQuery = (daoAddress?: string) => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.DAO_FWD_MSG_FEE, daoAddress],
    async () => {
      const res = await getDaoFwdMsgFee(clients!.clientV2, daoAddress!);
      return fromNano(res);
    },
    {
      enabled: !!daoAddress && !!clients?.clientV2,
    }
  );
};

export const useGetClients = () => {
  return useQuery(
    [QueryKeys.CLIENTS],
    async () => {
      return {
        clientV2: await getClientV2(),
        clientV4: await getClientV4(),
      };
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useGetCreateDaoFeeQuery = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.CREATE_DAO_FEE],
    async () => {
      const res = await getCreateDaoFee(clients!.clientV2, releaseMode);
      return fromNano(res);
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};

export const useGetRegistryAdminQuery = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.REGISTRY_ADMIN],
    async () => {
      return getRegistryAdmin(clients!.clientV2, releaseMode);
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};

export const useGetRegistryIdQuery = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.REGISTRY_ID],
    async () => {
      return getRegistryId(clients!.clientV2, releaseMode);
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};

export const useConnectedWalletVotingPowerQuery = (
  proposal?: Proposal | null,
  proposalAddress?: string
) => {
  const connectedWallet = useConnection().address;

  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.SIGNLE_VOTING_POWER, connectedWallet, proposalAddress],
    async ({ signal }) => {
      const allNftHolders = await lib.getAllNftHolders(
        proposalAddress!,
        clients!.clientV4,
        proposal!.metadata!,
        signal
      );

      Logger(`Fetching voting power for account: ${connectedWallet}`);

      const strategy = getVoteStrategyType(
        proposal?.metadata?.votingPowerStrategies
      );

      const result = await getSingleVoterPower(
        clients!.clientV4,
        connectedWallet!,
        proposal?.metadata!,
        strategy,
        allNftHolders
      );

      return nFormatter(Number(fromNano(result)));
    },
    {
      enabled:
        !!connectedWallet &&
        !!proposal &&
        !!clients?.clientV4 &&
        !!proposalAddress,
    }
  );
};
