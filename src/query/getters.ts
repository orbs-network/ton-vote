import { useQuery } from "@tanstack/react-query";
import { releaseMode, QueryKeys, IS_DEV, PROD_TEST_DAOS } from "config";
import { Dao, Proposal } from "types";
import _ from "lodash";
import {
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
  getDaoMetadata,
  getSingleVoterPower,
  getTransactions,
  getDaoState,
  getRegistryState,
} from "ton-vote-contracts-sdk";
import {
  getVoteStrategyType,
  isDaoWhitelisted,
  isProposalWhitelisted,
  Logger,
  nFormatter,
  validateServerUpdateTime,
} from "utils";
import {
  FOUNDATION_DAO_ADDRESS,
  FOUNDATION_PROPOSALS,
  FOUNDATION_PROPOSALS_ADDRESSES,
} from "data/foundation/data";
import { useNewDataStore, useSyncStore } from "store";
import { getDaoFromContract, lib } from "lib/lib";
import { api } from "api";
import {
  useDaoAddressFromQueryParam,
  useDevFeatures,
  useProposalAddress,
} from "hooks";
import { fromNano, Transaction } from "ton-core";
import { ReactQueryConfig } from "./types";
import { mock } from "mock/mock";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

export const useRegistryStateQuery = () => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.REGISTRY_STATE],
    async () => {
      const result = await getRegistryState(clients!.clientV2, releaseMode);

      return {
        ...result,
        deployAndInitDaoFee: result
          ? fromNano(result!.deployAndInitDaoFee)
          : "",
      };
    },
    {
      enabled: !!clients?.clientV2,
    }
  );
};

export const useDaoStateQuery = (daoAddress?: string) => {
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.DAO_STATE],
    async () => {
      if (mock.isMockDao(daoAddress!))
        return {
          registry: "",
          owner: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
          proposalOwner: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
          metadata: "",
          daoIndex: 2,
          fwdMsgFee: 2,
        };
      const result = await getDaoState(clients!.clientV2, daoAddress!);
      return {
        ...result,
        fwdMsgFee: fromNano(result!.fwdMsgFee),
      };
    },
    {
      enabled: !!clients?.clientV2 && !!daoAddress,
    }
  );
};

export const useDaosQuery = (config?: ReactQueryConfig) => {
  const { daos: newDaosAddresses, removeDao } = useNewDataStore();
  const { getDaoUpdateMillis } = useSyncStore();
  const devFeatures = useDevFeatures();

  return useQuery(
    [QueryKeys.DAOS, devFeatures],
    async ({ signal }) => {
      const payload = (await lib.getDaos(signal)) || [];

      const promise = await Promise.allSettled(
        _.map(payload, async (dao): Promise<Dao> => {
          const metadataLastUpdate = getDaoUpdateMillis(dao.daoAddress);
          let metadataArgs = dao.daoMetadata.metadataArgs;
          const isServerUpToDate = await getIsServerUpToDate(
            metadataLastUpdate
          );

          if (!isServerUpToDate) {
            metadataArgs = await getDaoMetadata(
              await getClientV2(),
              dao.daoMetadata.metadataAddress
            );
            console.log(metadataArgs);
          }

          return {
            ...dao,
            daoMetadata: {
              metadataAddress: "",
              metadataArgs,
            },
          };
        })
      );

      const prodDaos = _.compact(
        promise.map((it) => {
          if (it.status === "fulfilled") {
            return it.value;
          } else {
            return null;
          }
        })
      );

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

      let result = _.filter(daos, (it) => isDaoWhitelisted(it.daoAddress));

      const daoIndex = _.findIndex(result, {
        daoAddress: FOUNDATION_DAO_ADDRESS,
      });

      const foundationDao = result.splice(daoIndex, 1);

      let allDaos = [...foundationDao, ...result];

      if (!devFeatures) {
        allDaos = _.filter(
          allDaos,
          (it) => !PROD_TEST_DAOS.includes(it.daoAddress)
        );
      }
      return allDaos;
    },
    {
      refetchInterval: config?.refetchInterval,
      staleTime: config?.staleTime,
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

  return useQuery<Dao>(
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

      const metadataLastUpdate = getDaoUpdateMillis(daoAddress!);

      const serverUpToDate = await getIsServerUpToDate(metadataLastUpdate);

      if (serverUpToDate) {
        removeDaoUpdateMillis(daoAddress!);
      }

      const dao = await lib.getDao(daoAddress!, !serverUpToDate, signal);
      const proposals = handleProposal(daoAddress!, dao.daoProposals);
      const daoProposals = IS_DEV
        ? _.concat(proposals, mock.proposalAddresses)
        : proposals;
      return {
        ...dao,
        daoProposals:
          daoAddress === FOUNDATION_DAO_ADDRESS
            ? [...daoProposals, ...FOUNDATION_PROPOSALS_ADDRESSES]
            : daoProposals,
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

export const useProposalQuery = (
  proposalAddress?: string,
  args?: ReactQueryConfig
) => {
  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const clients = useGetClients().data;
  const getContractStateCallback = useGetContractState();

  return useQuery(
    [QueryKeys.PROPOSAL, proposalAddress],
    async ({ signal }) => {
      const isMockProposal = mock.getMockProposal(proposalAddress!);
      if (isMockProposal) {
        return isMockProposal;
      }
      const foundationProposal = FOUNDATION_PROPOSALS[proposalAddress!];
      if (foundationProposal) {
        return foundationProposal;
      }

      if (!isWhitelisted) {
        throw new Error("Proposal not whitelisted");
      }

      let proposal;
      try {
        proposal = await api.getProposal(proposalAddress!, signal);
      } catch (error) {
        proposal = await getContractStateCallback(proposalAddress!);
      }
      if (_.isEmpty(proposal?.metadata)) {
        Logger("List proposal not found in server, fetching from contract");
        return getContractStateCallback(proposalAddress!);
      }
      Logger(`List, fetching proposal from api ${proposalAddress}`);
      return proposal;
    },
    {
      enabled:
        !!proposalAddress &&
        !!clients?.clientV2 &&
        !!clients.clientV4 &&
        !args?.disabled,
      staleTime: args?.staleTime || 30_000,
      retry: isWhitelisted ? 3 : false,
      refetchInterval: isWhitelisted ? args?.refetchInterval : undefined,
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

export const useGetContractState = () => {
  const clients = useGetClients().data;
  return async (proposalAddress: string, latestMaxLtAfterTx?: string) => {
    let transactions: Transaction[] = [];
    if (latestMaxLtAfterTx) {
      const result = await getTransactions(clients!.clientV2, proposalAddress!);
      transactions = filterTxByTimestamp(result.allTxns, latestMaxLtAfterTx);
    }

    return lib.getProposalFromContract(
      clients!.clientV2,
      clients!.clientV4,
      proposalAddress!,
      undefined,
      transactions
    );
  };
};

export const getIsServerUpToDate = async (itemLastUpdateTime?: number) => {
  if (!itemLastUpdateTime) return true;
  if (itemLastUpdateTime) {
    const serverLastUpdate = await api.getUpdateTime();

    if (!validateServerUpdateTime(serverLastUpdate, itemLastUpdateTime)) {
      Logger("server is not updated, fetching from contract");
      return false;
    } else {
      return true;
    }
  }
};
