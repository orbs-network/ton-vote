import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BASE_FEE, getRelaseMode, QueryKeys } from "config";
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
  newRegistry,
  ProposalMetadata,
  setCreateDaoFee,
  setFwdMsgFee,
  setRegistryAdmin,
} from "ton-vote-contracts-sdk";
import { getProposalStatus, isDaoWhitelisted, Logger } from "utils";
import { OLD_DAO, proposals } from "data/foundation/data";
import { useNewDataStore } from "store";
import { lib } from "lib/lib";
import { api } from "api";
import { useDaoAddressFromQueryParam, useGetSender } from "hooks";
import { useConnection } from "ConnectionProvider";
import { showPromiseToast } from "toasts";
import { fromNano } from "ton-core";
import { delay } from "@ton-defi.org/ton-connection";

export const useDaosQuery = (refetchInterval?: number) => {
  const { daos: newDaosAddresses, removeDao } = useNewDataStore();

  return useQuery(
    [QueryKeys.DAOS],
    async ({ signal }) => {
      const res = (await lib.getDaos(signal)) || [];
      const daos = [OLD_DAO, ...res];

      if (_.size(newDaosAddresses)) {
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

        const newDaosMap = await promise;
        const newDaos = _.compact(newDaosMap);
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
  daoAddress: string,
  refetchInterval?: number,
  staleTime: number = Infinity
) => {
  const handleProposal = useHandleNewProposals();
  const queryClient = useQueryClient();
  const isWhitelisted = isDaoWhitelisted(daoAddress);

  return useQuery(
    [QueryKeys.DAO, daoAddress],
    async ({ signal }) => {
      if (!isWhitelisted) {
        throw new Error("DAO not whitelisted");
      }
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

export const useCreateNewRegistry = () => {
  const getSender = useGetSender();
  const address = useConnection().address;

  return useMutation(async () => {
    const clientV2 = await getClientV2();
    const sender = getSender();
    return newRegistry(
      sender,
      clientV2,
      getRelaseMode(),
      BASE_FEE.toString(),
      address!
    );
  });
};

export const useSetCreateDaoFee = () => {
  const getSender = useGetSender();
  const { refetch } = useGetCreateDaoFee();
  return useMutation(
    async (value: number) => {
      const client = await getClientV2();
      const promise = setCreateDaoFee(
        getSender(),
        client,
        getRelaseMode(),
        BASE_FEE.toString(),
        value.toString()
      );

      showPromiseToast({
        promise,
        loading: "Setting create DAO fee...",
        success: "Create DAO fee set",
        error: "Failed to set create DAO fee",
      });

      return promise;
    },
    {
      onSuccess: () => refetch(),
    }
  );
};

export const useSetDaoFwdMsgFee = (daoAddress?: string) => {
  const getSender = useGetSender();
  const { refetch } = useGetDaoFwdMsgFee(daoAddress);
  return useMutation(
    async ({ daoIds, amount }: { daoIds: number[]; amount: number }) => {
      const client = await getClientV2();
      const promise = setFwdMsgFee(
        getSender(),
        client,
        getRelaseMode(),
        BASE_FEE.toString(),
        daoIds.map((it) => it.toString()),
        amount.toString()
      );

      showPromiseToast({
        promise,
        loading: "Setting create Proposal fee...",
        success: "Create Proposal fee set",
        error: "Failed to set create Proposal fee",
      });

      return promise;
    },
    {
      onSuccess: () => refetch(),
    }
  );
};

export const useSetRegistryAdmin = () => {
  const getSender = useGetSender();
  const { refetch } = useGetRegistryAdmin();
  return useMutation(
    async (newRegistryAdmin: string) => {
      const client = await getClientV2();

      return setRegistryAdmin(
        getSender(),
        client,
        getRelaseMode(),
        BASE_FEE.toString(),
        newRegistryAdmin
      );
    },
    {
      onSuccess: () => refetch(),
    }
  );
};

export const useGetDaoFwdMsgFee = (daoAddress?: string) => {
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

export const useGetCreateDaoFee = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.CREATE_DAO_FEE],
    async () => {
      const res = await getCreateDaoFee(clients!.clientV2, getRelaseMode());
      return fromNano(res);
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};

export const useGetRegistryAdmin = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.REGISTRY_ADMIN],
    async () => {
      return getRegistryAdmin(clients!.clientV2, getRelaseMode());
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};

export const useGetRegistryId = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.REGISTRY_ID],
    async () => {
      return getRegistryId(clients!.clientV2, getRelaseMode());
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};
