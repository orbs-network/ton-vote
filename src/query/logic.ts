import { api } from "api";
import { DAOS_PAGE_REFETCH_INTERVAL, DAO_REFETCH_INTERVAL } from "config";
import { routes } from "consts";
import { useCurrentRoute } from "hooks";
import { getDaoFromContract, lib } from "lib/lib";
import _ from "lodash";
import { useMemo } from "react";
import {
  useNewDataStore,
  useProposalPersistedStore,
  useSyncStore,
} from "store";
import { Transaction } from "ton-core";
import {
  filterTxByTimestamp,
  getClientV2,
  getDaoMetadata,
  getTransactions,
} from "ton-vote-contracts-sdk";
import { Dao } from "types";
import { Logger, validateServerUpdateTime } from "utils";
import { useGetClients } from "./getters";

export const useNewDaoAddresses = () => {
  const { daos: newDaosAddresses, removeDao } = useNewDataStore();

  return async (daos: Dao[]) => {
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
      daos = [daos[0], ...newDaos, ...daos.slice(1)];
    }
    return daos;
  };
};

export const useIsDaosUpToDate = () => {
  const { getDaoUpdateMillis } = useSyncStore();

  return async (daos: Dao[]) => {
    const promise = await Promise.allSettled(
      _.map(daos, async (dao): Promise<Dao> => {
        const metadataLastUpdate = getDaoUpdateMillis(dao.daoAddress);
        let metadataArgs = dao.daoMetadata.metadataArgs;
        const isServerUpToDate = await getIsServerUpToDate(metadataLastUpdate);

        if (!isServerUpToDate) {
          metadataArgs = await getDaoMetadata(
            await getClientV2(),
            dao.daoMetadata.metadataAddress
          );
          Logger(metadataArgs);
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

    return _.compact(
      promise.map((it) => {
        if (it.status === "fulfilled") {
          return it.value;
        } else {
          return null;
        }
      })
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

export const useDaoNewProposals = () => {
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

export const useDaoQueryConfig = () => {
  const route = useCurrentRoute();

  return useMemo(() => {
    return {
      staleTime: route === routes.proposal ? Infinity : 10_000,
      refetchInterval:
        route === routes.proposal ? undefined : DAO_REFETCH_INTERVAL,
    };
  }, [route]);
};

export const useDaosQueryConfig = () => {
  const route = useCurrentRoute();

  return useMemo(() => {
    return {
      staleTime: 10_000,
      refetchInterval:
        route === routes.spaces ? DAOS_PAGE_REFETCH_INTERVAL : undefined,
    };
  }, [route]);
};

export const useIsProposalPage = () => {
  const route =  useCurrentRoute()
  return route === routes.proposal || route === routes.editProposal
};

export const useProposalPageLogic = (
  proposalAddress: string,
  isCustomEndpoint?: boolean
) => {
  const getContractStateCallback = useGetContractState();
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistedStore();
  const { getProposalUpdateMillis, removeProposalUpdateMillis } =
    useSyncStore();

  return async (signal?: AbortSignal) => {
    const latestMaxLtAfterTx = !isCustomEndpoint
      ? getLatestMaxLtAfterTx(proposalAddress!)
      : undefined;

    if (isCustomEndpoint) {
      Logger("custom endpoint selected");
      return getContractStateCallback(proposalAddress, latestMaxLtAfterTx);
    }

    const isServerUpToDate = await getIsServerUpToDate(
      getProposalUpdateMillis(proposalAddress)
    );

    if (!isServerUpToDate) {
      return getContractStateCallback(proposalAddress, latestMaxLtAfterTx);
    }
    removeProposalUpdateMillis(proposalAddress);

    if (latestMaxLtAfterTx) {
      const serverMaxLt = await api.getMaxLt(proposalAddress!, signal);

      if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
        Logger(
          `server maxLt is outdated, fetching from contract, maxLt: ${latestMaxLtAfterTx}, serverMaxLt: ${serverMaxLt}`
        );
        return getContractStateCallback(proposalAddress, latestMaxLtAfterTx);
      }
    }
    setLatestMaxLtAfterTx(proposalAddress!, undefined);
  };
};
