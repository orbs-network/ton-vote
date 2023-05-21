import { useQuery } from "@tanstack/react-query";
import { releaseMode, QueryKeys, IS_DEV } from "config";
import { Proposal, ProposalStatus } from "types";
import _ from "lodash";
import {
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
  getCreateDaoFee,
  getDaoFwdMsgFee,
  getDaoMetadata,
  getRegistry,
  getRegistryAdmin,
  getRegistryId,
  getSingleVoterPower,
  getTransactions,
  ProposalMetadata,
} from "ton-vote-contracts-sdk";
import {
  getProposalStatus,
  getVoteStrategyType,
  isDaoWhitelisted,
  isProposalWhitelisted,
  Logger,
  nFormatter,
  validateServerUpdateTime,
} from "utils";
import { FOUNDATION_DAO, proposals } from "data/foundation/data";
import { useNewDataStore, useProposalPersistedStore, useSyncStore } from "store";
import { getDaoFromContract, lib } from "lib/lib";
import { api } from "api";
import { useDaoAddressFromQueryParam, useProposalAddress } from "hooks";
import { fromNano, Transaction } from "ton-core";
import { GetProposalArgs } from "./types";
import { mock } from "mock/mock";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";

export const useDaosQuery = (refetchInterval?: number) => {
  const { daos: newDaosAddresses, removeDao } = useNewDataStore();
  const { getDaoUpdateMillis } = useSyncStore();

  return useQuery(
    [QueryKeys.DAOS],
    async ({ signal }) => {
      const serverLastUpdate = await api.getUpdateTime();

      const payload = (await lib.getDaos(signal)) || [];
      const promise = await Promise.allSettled(
        _.map(payload, async (dao) => {
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

      const res = _.compact(
        promise.map((it) => {
          if (it.status === "fulfilled") {
            return it.value;
          } else {
            return null;
          }
        })
      );

      const prodDaos = [FOUNDATION_DAO, ...res];

      const daos = IS_DEV ? _.concat(prodDaos, mock.daos) : prodDaos;

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
  const isWhitelisted = isDaoWhitelisted(daoAddress);
  const { getDaoUpdateMillis, removeDaoUpdateMillis } = useSyncStore();

  return useQuery(
    [QueryKeys.DAO, daoAddress],
    async ({ signal }) => {      
      const mockDao = mock.isMockDao(daoAddress!);
      if (mockDao) {
        return {
          ...mockDao,
          daoProposals: mock.proposalAddresses,
        };
      }
        if (!isWhitelisted) {
          throw new Error("DAO not whitelisted");
        }
      if (daoAddress === FOUNDATION_DAO.daoAddress) {
        return FOUNDATION_DAO;
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
      const proposals = handleProposal(daoAddress!, dao.daoProposals);
      const daoProposals = IS_DEV
        ? _.concat(proposals, mock.proposalAddresses)
        : proposals;
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
  const connectedWallet = useTonAddress();

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

export const useGetRegistryAddressQuery = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.REGISTRY_ADDRESS],
    () => {
      return getRegistry(clients!.clientV2, releaseMode);
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};

export const useProposalPageQuery = (isCustomEndpoint: boolean = false) => {
  const address = useProposalAddress();
  return useProposalQuery(address, {
    refetchInterval: 30_000,
    isCustomEndpoint,
    validateMaxLt: true,
    validateResults: true,
  });
};

export const useProposalQuery = (
  proposalAddress?: string,
  args?: GetProposalArgs
) => {
  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const clients = useGetClients().data;
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistedStore();

  const queryKey = [QueryKeys.PROPOSAL, proposalAddress];

  return useQuery(
    queryKey,
    async ({ signal }) => {
      const isMockProposal = mock.getMockProposal(proposalAddress!);
      if (isMockProposal) {
        return isMockProposal;
      }
      const latestMaxLtAfterTx = getLatestMaxLtAfterTx(proposalAddress!);

      const foundationProposal = proposals[proposalAddress!];
      if (foundationProposal) {
        return foundationProposal;
      }
      if (!isWhitelisted) {
        throw new Error("Proposal not whitelisted");
      }

      const getContractState = async () => {
        let transactions: Transaction[] = [];
        if (latestMaxLtAfterTx) {
          const result = await getTransactions(
            clients!.clientV2,
            proposalAddress!
          );
          transactions = filterTxByTimestamp(
            result.allTxns,
            latestMaxLtAfterTx
          );
        }

        return lib.getProposalFromContract(
          clients!.clientV2,
          clients!.clientV4,
          proposalAddress!,
          undefined,
          transactions
        );
      };
      
      if (args?.isCustomEndpoint) {
        Logger("isCustomEndpoint selected");
        return getContractState();
      }

      if (args?.validateMaxLt && latestMaxLtAfterTx) {
        const serverMaxLt = await api.getMaxLt(proposalAddress!, signal);

        if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
          Logger(
            `server latestMaxLtAfterTx is outdated, fetching from contract, latestMaxLtAfterTx: ${latestMaxLtAfterTx}, serverMaxLt: ${serverMaxLt}`
          );
          return getContractState();
        }
      }
      setLatestMaxLtAfterTx(proposalAddress!, undefined);
      const proposal = await api.getProposal(proposalAddress!, signal);
      if (_.isEmpty(proposal.metadata)) {
        Logger("Proposal not found is server, fetching from contract");

        return getContractState();
      }
      if (args?.validateResults && _.isEmpty(proposal.proposalResult)) {
        Logger("Proposal result is not synced, fetching from contract");
        return getContractState();
      }
      return proposal;
    },
    {
      enabled: !!proposalAddress && !!clients?.clientV2 && !!clients.clientV4,
      staleTime: args?.staleTime !== undefined ? args?.staleTime : 10_000,
      retry: isWhitelisted ? 3 : false,
      refetchInterval: args?.refetchInterval,
    }
  );
};


export const useWalletsQuery = () => {
  const [tonConnectUI] = useTonConnectUI();
  return useQuery(
    ["useWalletsQuery"],
    () => {
      return tonConnectUI.getWallets();
    },
    {
      staleTime: Infinity,
      enabled: !!tonConnectUI,
    }
  );
};