import { useTonAddress } from "@tonconnect/ui-react";
import { api } from "api";
import {
  QueryKeys,
  REFETCH_INTERVALS,
} from "config";
import { routes } from "consts";
import { FOUNDATION_PROPOSALS } from "data/foundation/data";
import { useCurrentRoute } from "hooks";
import { getDaoFromContract, lib } from "lib/lib";
import _ from "lodash";
import { mock } from "mock/mock";
import { useMemo } from "react";
import { useNewDataStore, useVotePersistedStore, useSyncStore } from "store";
import { Transaction } from "ton-core";
import {
  filterTxByTimestamp,
  getAllVotes,
  getClientV2,
  getDaoMetadata,
  getTransactions,
  getSingleVoterPower,
  getClientV4,
  calcProposalResult,
} from "ton-vote-contracts-sdk";
import { Dao, Proposal } from "types";
import {
  getVoteStrategyType,
  Logger,
  parseVotes,
  validateServerUpdateTime,
} from "utils";
import { useGetClients } from "./getters";

import retry from "async-retry";
import { useQueryClient } from "@tanstack/react-query";

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

export const useGetContractProposal = (proposalAddress: string) => {
  const clients = useGetClients().data;
  return async (latestMaxLtAfterTx?: string) => {
    const promise = async (bail: any, attempt: number) => {
      Logger(
        `fetching proposal from contract, address: ${proposalAddress}, attempt ${attempt}`
      );
      let transactions: Transaction[] = [];
      if (latestMaxLtAfterTx) {
        const result = await getTransactions(
          clients!.clientV2,
          proposalAddress!
        );
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

    return await retry(promise, { retries: 3 });
  };
};

export const useDaoQueryConfig = () => {
  const route = useCurrentRoute();

  return useMemo(() => {
    return {
      staleTime: route === routes.proposal ? Infinity : 10_000,
      refetchInterval:
        route === routes.proposal ? undefined : REFETCH_INTERVALS.dao,
    };
  }, [route]);
};

export const useDaosQueryConfig = () => {
  const route = useCurrentRoute();

  return useMemo(() => {
    return {
      staleTime: 10_000,
      refetchInterval: route === routes.spaces ? REFETCH_INTERVALS.daos : undefined,
    };
  }, [route]);
};

const useGetServerProposalWithFallback = (address: string) => {
  const getContractStateCallback = useGetContractProposal(address);

  return async (maxLt?: string, signal?: AbortSignal) => {
    const proposal = await api.getProposal(address!, signal);

    if (proposal) {
      return proposal;
    }

    return getContractStateCallback(maxLt);
  };
};

export const useGetProposal = (proposalAddress: string) => {
  const votePersistStore = useVotePersistedStore();
  const { getProposalUpdateMillis, removeProposalUpdateMillis } =
    useSyncStore();

  const getServerProposal = useGetServerProposalWithFallback(proposalAddress!);

  const getContractProposal = useGetContractProposal(proposalAddress);

  return async (signal?: AbortSignal): Promise<Proposal | null> => {
    const mockProposal = mock.getMockProposal(proposalAddress!);
    if (mockProposal) {
      return mockProposal;
    }
    const foundationProposal = FOUNDATION_PROPOSALS[proposalAddress!];
    if (foundationProposal) {
      return foundationProposal;
    }

    const votePersistValues = votePersistStore.getValues(proposalAddress!);

    const latestMaxLtAfterTx = votePersistValues.latestMaxLtAfterTx;

    const isMetadataUpToDateInServer = await getIsServerUpToDate(
      getProposalUpdateMillis(proposalAddress)
    );

    if (!isMetadataUpToDateInServer) {
      return getContractProposal(latestMaxLtAfterTx);
    } else {
      removeProposalUpdateMillis(proposalAddress);
    }

    const proposal = await getServerProposal(latestMaxLtAfterTx, signal);

    if (!proposal) return null;

    if (
      !latestMaxLtAfterTx ||
      Number(proposal?.maxLt) >= Number(latestMaxLtAfterTx)
    ) {
      votePersistStore.resetValues(proposalAddress!);

      return proposal;
    }

    Logger(
      `server proposal is not up to date, getting results and vote from local storage, proposal maxLt: ${proposal?.maxLt}, latestMaxLtAfterTx: ${latestMaxLtAfterTx}`
    );

    // if latestMaxLtAfterTx greater then proposal maxLt, that means that user voted, and
    // we need to get his vote and proposal result from local storage, because server is not up to date

    if (!votePersistValues.results) {
      return proposal;
    }

    return {
      ...proposal,
      proposalResult: votePersistValues.results,
      votes: votePersistValues.vote
        ? [votePersistValues.vote, ...proposal.votes]
        : proposal.votes,
    };
  };
};

export const useVoteSuccessCallback = (proposalAddress: string) => {
  const walletAddress = useTonAddress();
  const clients = useGetClients().data;
  const store = useVotePersistedStore();

  const queryClient = useQueryClient();

  return async (proposal: Proposal) => {
    const clientV2 = clients?.clientV2 || (await getClientV2());
    const clientV4 = clients?.clientV4 || (await getClientV4());
    const { allTxns, maxLt } = await getTransactions(
      clientV2,
      proposalAddress,
      proposal.maxLt
    );

    const userTx = _.find(allTxns, (tx) => {
      return tx.inMessage?.info.src?.toString() === walletAddress;
    });

    if (!userTx) return;

    const nftItemsHolders = await lib.getAllNftHolders(
      proposalAddress,
      clientV4,
      proposal.metadata!
    );

    const singleVotingPower = await getSingleVoterPower(
      clientV4,
      walletAddress,
      proposal.metadata!,
      getVoteStrategyType(proposal.metadata!.votingPowerStrategies),
      nftItemsHolders
    );

    const rawVotes = getAllVotes([userTx], proposal.metadata!);
    const votingPower = proposal.votingPower || {};

    const votes = {
      ...proposal.rawVotes,
      [walletAddress]: rawVotes[walletAddress],
    };

    votingPower[walletAddress] = singleVotingPower;

    const results = calcProposalResult(votes, votingPower);
    const walletVote = parseVotes(rawVotes, votingPower)[0];

    queryClient.setQueryData(
      [QueryKeys.PROPOSAL, proposalAddress],
      (prev?: any) => {
        return {
          ...prev,
          proposalResult: results,
          votes: walletVote ? [walletVote, ...prev?.votes] : prev?.votes,
        };
      }
    );

    Logger(`vote success manual state update`);
    Logger(userTx, "user tx");
    Logger(maxLt, "maxLt");
    Logger(walletVote, "walletVote");
    Logger(results, "results");
    // we save this data in local storage, and display it untill the server is up to date
    store.setValues(proposalAddress, maxLt, walletVote, results);
  };
};
