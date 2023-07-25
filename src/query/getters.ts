import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  releaseMode,
  QueryKeys,
  IS_DEV,
  PROD_TEST_DAOS,
  REFETCH_INTERVALS,
  BLACKLISTED_PROPOSALS,
} from "config";
import { Dao, Proposal } from "types";
import _ from "lodash";
import {
  getClientV2,
  getClientV4,
  getSingleVoterPower,
  getDaoState,
  getRegistryState,
  readJettonMinterOrNftCollectionMetadata,
  readNftItemMetadata,
  readJettonWalletMedata,
} from "ton-vote-contracts-sdk";
import {
  getIsOneWalletOneVote,
  getProposalSymbol,
  getVoteStrategyType,
  isDaoWhitelisted,
  isProposalBlacklisted,
  Logger,
  nFormatter,
  validateAddress,
} from "utils";
import {
  FOUNDATION_DAO_ADDRESS,
  FOUNDATION_PROPOSALS_ADDRESSES,
} from "data/foundation/data";
import { useSyncStore, useVotePersistedStore, useVoteStore } from "store";
import { contract } from "contract";
import { useCurrentRoute, useDevFeatures } from "hooks/hooks";
import { fromNano } from "ton-core";
import { mock } from "mock/mock";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import {
  getIsServerUpToDate,
  useDaoNewProposals,
  useIsDaosUpToDate,
  useNewDaoAddresses,
} from "./hooks";
import { api } from "api";
import { useMemo, useRef, useState } from "react";
import { routes } from "consts";
import { lib } from "lib";
import { useAnalytics } from "analytics";

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

export const useDaosQuery = () => {
  const devFeatures = useDevFeatures();

  const handleNewDaoAddresses = useNewDaoAddresses();
  const handleDaosUpToDate = useIsDaosUpToDate();
  const route = useCurrentRoute();

  const config = useMemo(() => {
    return {
      staleTime: 10_000,
      refetchInterval:
        route === routes.spaces ? REFETCH_INTERVALS.daos : undefined,
    };
  }, [route]);

  return useQuery(
    [QueryKeys.DAOS, devFeatures],
    async ({ signal }) => {
      const payload = (await api.getDaos(signal)) || [];

      const prodDaos = await handleDaosUpToDate(payload);

      // add mock daos if dev mode
      let daos = IS_DEV ? _.concat(prodDaos, mock.daos) : prodDaos;

      // add new dao addresses, if exist in local storage
      daos = await handleNewDaoAddresses(daos);

      // filter daos by whitelist
      let allDaos = _.filter(daos, (it) => isDaoWhitelisted(it.daoAddress));

      const daoIndex = _.findIndex(allDaos, {
        daoAddress: FOUNDATION_DAO_ADDRESS,
      });

      const foundationDao = _.first(allDaos.splice(daoIndex, 1));

      if (foundationDao) {
        foundationDao.daoProposals = FOUNDATION_PROPOSALS_ADDRESSES;
        allDaos = [foundationDao, ...allDaos];
      }
      if (!devFeatures) {
        allDaos = _.filter(
          allDaos,
          (it) => !PROD_TEST_DAOS.includes(it.daoAddress)
        );
      }
      return allDaos;
    },
    {
      refetchInterval: config.refetchInterval,
      staleTime: Infinity,
    }
  );
};

export const useDaoQuery = (daoAddress: string) => {
  const addNewProposals = useDaoNewProposals();
  const isWhitelisted = isDaoWhitelisted(daoAddress);
  const { getDaoUpdateMillis, removeDaoUpdateMillis } = useSyncStore();
  const analytics = useAnalytics();
  const route = useCurrentRoute();

  const config = useMemo(() => {
    return {
      staleTime: route === routes.proposal ? Infinity : 5_000,
      refetchInterval:
        route === routes.proposal ? undefined : REFETCH_INTERVALS.dao,
    };
  }, [route]);

  const queryClient = useQueryClient();
  const key = [QueryKeys.DAO, daoAddress];
  return useQuery<Dao | null>(
    key,
    async ({ signal }) => {
      if (!isWhitelisted) {
        throw new Error("DAO not whitelisted");
      }

      const mockDao = mock.isMockDao(daoAddress!);
      if (mockDao) {
        return {
          ...mockDao,
          daoProposals: mock.proposalAddresses,
        };
      }

      const metadataLastUpdate = getDaoUpdateMillis(daoAddress!);

      const isMetadataUpToDate = await getIsServerUpToDate(metadataLastUpdate);

      const getDaoFromContract = () => contract.getDao(daoAddress);

      let dao;
      try {
        if (!isMetadataUpToDate) {
          dao = await getDaoFromContract();
        } else {
          removeDaoUpdateMillis(daoAddress!);
        }
      } catch (error) {
        analytics.getDaoFromContractFailed(daoAddress!, error);
      }

      if (!dao) {
        try {
          dao = await api.getDao(daoAddress!, signal);
        } catch (error) {
          analytics.getDaoFromServerFailed(daoAddress!, error);
        }
      }

      if (!dao) {
        try {
          dao = await getDaoFromContract();
        } catch (error) {
          analytics.getDaoFromContractFailed(daoAddress!, error);
        }
      }

      // try to return dao from cache
      if (!dao) {
        dao = queryClient.getQueryData<Dao>(key) || null;
      }

      if (!dao) {
        throw new Error("DAO not found");
      }

      const proposals = addNewProposals(daoAddress!, dao.daoProposals);
      let daoProposals = IS_DEV
        ? _.concat(proposals, mock.proposalAddresses)
        : proposals;

      daoProposals = _.filter(
        daoProposals,
        (it) => !BLACKLISTED_PROPOSALS.includes(it)
      );

      if (daoAddress === FOUNDATION_DAO_ADDRESS) {
        daoProposals = FOUNDATION_PROPOSALS_ADDRESSES;
      }
      return {
        ...dao,
        daoProposals,
      };
    },
    {
      staleTime: config.staleTime,
      refetchInterval: isWhitelisted ? config.refetchInterval : undefined,
      enabled: !!daoAddress,
      retry: false,
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

export const useConnectedWalletVotingPowerQuery = (
  proposal?: Proposal | null,
  proposalAddress?: string
) => {
  const connectedWallet = useTonAddress();
  const clients = useGetClients().data;
  return useQuery(
    [QueryKeys.SIGNLE_VOTING_POWER, connectedWallet, proposalAddress],
    async ({ signal }) => {
      const allNftHolders = await lib.getAllNFTHolders(
        proposalAddress!,
        proposal?.metadata!,
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

      const symbol = getProposalSymbol(
        proposal?.metadata?.votingPowerStrategies
      );

      if (getIsOneWalletOneVote(proposal?.metadata?.votingPowerStrategies)) {
        return {
          votingPower: result,
          votingPowerText: `${nFormatter(Number(result))} ${symbol}`,
        };
      }

      return {
        votingPowerText: `${nFormatter(Number(fromNano(result)))} ${symbol}`,
        votingPower: result,
      };
    },
    {
      enabled: !!connectedWallet && !!proposal && !!proposalAddress,
    }
  );
};

interface ProposalQueryArgs {
  disabled?: boolean;
  isCustomEndpoint?: boolean;
}

const useGetProposalCallback = () => {
  const analytics = useAnalytics();
  const { getProposalUpdateMillis, removeProposalUpdateMillis } =
    useSyncStore();
  const votePersistStore = useVotePersistedStore();

  return async (
    proposalAddress: string,
    currentData?: Proposal | null,
    signal?: AbortSignal
  ) => {
    if (isProposalBlacklisted(proposalAddress)) {
      throw new Error("Proposal not found");
    }

    const mockProposal = mock.getMockProposal(proposalAddress!);
    if (mockProposal) {
      return mockProposal;
    }
    const foundationProposals = await (
      await import("../data/foundation/data")
    ).getFoundationProposals();
    const foundationProposal = foundationProposals[proposalAddress!];
    if (foundationProposal) {
      return foundationProposal;
    }
    const votePersistValues = votePersistStore.getValues(proposalAddress!);
    // maxLtAfterVote is maxLt after voting
    const maxLtAfterVote = votePersistValues.maxLtAfterVote;

    const getProposalFromContract = () => {
      return contract.getProposal({
        proposalAddress,
        maxLt: maxLtAfterVote || currentData?.maxLt,
      });
    };

    const isMetadataUpToDateInServer = await getIsServerUpToDate(
      getProposalUpdateMillis(proposalAddress)
    );

    // if updated proposal metadata, and sever is not up to date, get proposal from contract
    try {
      if (!isMetadataUpToDateInServer) {
        return getProposalFromContract();
      } else {
        removeProposalUpdateMillis(proposalAddress);
      }
    } catch (error) {
      analytics.getProposalFromContractFailed(
        proposalAddress,
        error instanceof Error ? error.message : ""
      );
    }

    let proposal;

    // try to fetch proposal from server
    try {
      proposal = await api.getProposal(proposalAddress!, signal);
    } catch (error) {
      analytics.getProposalFromServerFailed(
        proposalAddress,
        error instanceof Error ? error.message : ""
      );
    }

    // try to fetch proposal from contract
    if (!proposal) {
      try {
        proposal = await getProposalFromContract();
      } catch (error) {
        analytics.getProposalFromContractFailed(
          proposalAddress,
          error instanceof Error ? error.message : ""
        );
      }
    }

    // failed to fetch proposal from server and contract, try to return current data from cache
    if (!proposal) {
      proposal = currentData;
    }

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    // check if server is up to date
    if (Number(proposal?.maxLt) < Number(maxLtAfterVote)) {
      Logger("Server is not up to date, return results from cache");
      const persistedResult = votePersistValues.results;
      const latestConnectedWalletVote = votePersistValues.vote;
      const filteredVotes = _.filter(
        proposal.votes,
        (it) => it.address !== latestConnectedWalletVote?.address
      );

      if (!persistedResult) {
        return proposal;
      }
        //server is not up to date, = return results from cache
        return {
          ...proposal,
          proposalResult: persistedResult,
          votes: latestConnectedWalletVote
            ? [latestConnectedWalletVote, ...filteredVotes]
            : filteredVotes,
        } as Proposal;
    }
    votePersistStore.resetValues(proposalAddress!);

    return proposal;
  };
};

export const useEnsureProposalQuery = () => {
  const queryClient = useQueryClient();
  const getProposal = useGetProposalCallback();

  return (proposalAddress: string) => {
    const key = [QueryKeys.PROPOSAL, proposalAddress];
    return queryClient.ensureQueryData(key, () => {
      const currentData = queryClient.getQueryData<Proposal | undefined>(key);
      return getProposal(proposalAddress, currentData);
    });
  };
};

export const useProposalQuery = (
  proposalAddress?: string,
  args?: ProposalQueryArgs
) => {
  const clients = useGetClients().data;
  const [error, setError] = useState(false);
  const route = useCurrentRoute();

  const getProposal = useGetProposalCallback();

  const config = useMemo(() => {

    const getRefetchInterval = () => {
      if(route === routes.proposal) {
        return 15_000;
      }      
       if (route === routes.airdrop) {
         return undefined;
       }

      return 30_000;
    }

    return {
      refetchInterval: getRefetchInterval(),
    };
  }, [route]);

  const queryClient = useQueryClient();
  const key = [QueryKeys.PROPOSAL, proposalAddress];

  return useQuery(
    key,
    async ({ signal }) => {
      const currentData = queryClient.getQueryData<Proposal | undefined>(key);
      return getProposal(proposalAddress!, currentData, signal);
    },
    {
      onError: (error: Error) => {
        setError(true);
      },
      refetchOnReconnect: false,
      enabled:
        !!proposalAddress &&
        !!clients?.clientV2 &&
        !!clients.clientV4 &&
        !args?.disabled,
      staleTime: Infinity,
      refetchInterval: error ? 0 : config.refetchInterval,
      retry: 0,
    }
  );
};

export const useWalletsQuery = () => {
  const [tonConnectUI] = useTonConnectUI();
  return useQuery(["useWalletsQuery"], () => tonConnectUI.getWallets(), {
    staleTime: Infinity,
    enabled: !!tonConnectUI,
  });
};

export const useEnsureAssetMetadataQuery = () => {
  const queryClient = useQueryClient();
  return (assetAddress: string) =>
    queryClient.ensureQueryData(["useAssetMetadataQuery", assetAddress]);
};

export const useReadJettonWalletMedata = (assetAddress?: string) => {
  const clientV2 = useGetClients().data?.clientV2;
  validateAddress(assetAddress);

  return useQuery<any>(
    ["readJettonWalletMedata", assetAddress],
    () => readJettonWalletMedata(clientV2!, assetAddress!),
    {
      enabled: !!clientV2 && !!assetAddress && validateAddress(assetAddress),
      staleTime: Infinity,
      refetchInterval: undefined,
    }
  );
};


export const useReadNftItemMetadata = (assetAddress?: string) => {
  const clientV2 = useGetClients().data?.clientV2;
  validateAddress(assetAddress);

  return useQuery<any>(
    ["useReadNftItemMetadata", assetAddress],
    () => readNftItemMetadata(clientV2!, assetAddress!),
    {
      enabled: !!clientV2 && !!assetAddress && validateAddress(assetAddress),
      staleTime: Infinity,
      refetchInterval: undefined,
    }
  );
};

export const useGetAllProposalsCallback = () => {
  const getProposal = useEnsureProposalQuery();

  return (proposals?: string[]) => {
    if (!proposals) return [];
    return Promise.all(
      proposals?.map((address) => {
        return getProposal(address);
      })
    );
  };
};
