import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { releaseMode, QueryKeys, REFETCH_INTERVALS, BLACKLISTED_PROPOSALS, IS_DEV } from "config";
import { Dao, Proposal } from "types";
import _ from "lodash";
import {
  getClientV4,
  getDaoState,
  getRegistryState,
  getSingleVoterPower,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import {
  getIsOneWalletOneVote,
  getProposalSymbol,
  getVoteStrategyType,
  isDaoWhitelisted,
  Logger,
  nFormatter,
  validateAddress,
} from "utils";
import {
  FOUNDATION_DAO_ADDRESS,
  FOUNDATION_PROPOSALS_ADDRESSES,
} from "data/foundation/data";
import { useSyncStore, useVotePersistedStore, useVoteStore } from "store";
import { contract, getDao } from "contract";
import { useCurrentRoute, useDevFeaturesMode } from "hooks/hooks";
import { fromNano } from "ton-core";
import { mock } from "mock/mock";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { api } from "api";
import { useMemo, useState } from "react";
import { routes } from "consts";
import { lib } from "lib";
import { analytics } from "analytics";
import { getProposalDescription } from "data/foundation/proposals-descriptions";
import { getIsServerUpToDate } from "./hooks";

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
    [QueryKeys.DAO_STATE, daoAddress],
    async () => {
      if (mock.isMockDao(daoAddress!)) {
        return mock.mockDaoState;
      }

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
  const devFeatures = useDevFeaturesMode();
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
    async ({ signal }) => lib.getDaos(signal),
    {
      refetchInterval: config.refetchInterval,
      staleTime: Infinity,
    }
  );
};

export const useDaoQuery = (daoAddress: string) => {
  const isWhitelisted = isDaoWhitelisted(daoAddress);
  const route = useCurrentRoute();
  const queryClient = useQueryClient();
  const syncStore = useSyncStore();

  const config = useMemo(() => {
    return {
      staleTime: route === routes.proposal ? Infinity : 5_000,
      refetchInterval:
        route === routes.proposal ? undefined : REFETCH_INTERVALS.dao,
    };
  }, [route]);

  const key = [QueryKeys.DAO, daoAddress];
  return useQuery<Dao | null>(
    key,
    async ({ signal }) => lib.getDao(daoAddress, signal),
    {
      staleTime: config.staleTime,
      refetchInterval: isWhitelisted ? config.refetchInterval : undefined,
      enabled: !!daoAddress,
      retry: false,
    }
  );
};

export const useGetClients = () => {
  return useQuery([QueryKeys.CLIENTS], async () => lib.getClients(), {
    staleTime: Infinity,
  });
};

export const useGetClientsCallback = () => {
  const queryClient = useQueryClient();

  return () => queryClient.ensureQueryData([QueryKeys.CLIENTS], lib.getClients);
};

export const useWalletVotingPowerQuery = (
  proposal?: Proposal | null,
  proposalAddress?: string
) => {
  const connectedWallet = useTonAddress();
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

      const clientV4 = await getClientV4();

      const result = await getSingleVoterPower(
        clientV4,
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
      staleTime: Infinity,
    }
  );
};

interface ProposalQueryArgs {
  disabled?: boolean;
  isCustomEndpoint?: boolean;
}

export const useEnsureProposalQuery = () => {
  const queryClient = useQueryClient();

  return (proposalAddress: string) => {
    const key = [QueryKeys.PROPOSAL, proposalAddress];
    return queryClient.ensureQueryData(key, () => {
      const currentData = queryClient.getQueryData<Proposal | undefined>(key);
      return lib.getProposal(proposalAddress, currentData);
    });
  }
}

export const useProposalQuery = (
  proposalAddress?: string,
  args?: ProposalQueryArgs
) => {
  const clients = useGetClients().data;
  const [error, setError] = useState(false);
  const route = useCurrentRoute();

  const config = useMemo(() => {
    const getRefetchInterval = () => {
      if (route === routes.proposal) {
        return 15_000;
      }
      if (route === routes.airdrop) {
        return undefined;
      }

      return 30_000;
    };

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
      return lib.getProposal(proposalAddress!, currentData, signal);
    },
    {
      onError: (error: Error) => {
        setError(true);
      },
      refetchOnReconnect: false,
      enabled:
        !!proposalAddress &&
        validateAddress(proposalAddress) &&
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

export const useReadJettonWalletMedata = (assetAddress?: string) => {
  return useQuery<any>(
    [QueryKeys.READ_JETTON_WALLET_METADATA, assetAddress],
    () => lib.readJettonMetadata(assetAddress!),
    {
      enabled: !!assetAddress && validateAddress(assetAddress),
      staleTime: Infinity,
      refetchInterval: undefined,
    }
  );
};

export const useReadJettonWalletMedataCallback = () => {
  const queryClient = useQueryClient();

  return async (assetAddress?: string) => {
    return queryClient.ensureQueryData(
      [QueryKeys.READ_JETTON_WALLET_METADATA, assetAddress],
      () => lib.readJettonMetadata(assetAddress!)
    );
  };
};

export const useReadNftCollectionMetadata = (assetAddress?: string) => {
  return useQuery<any>(
    [QueryKeys.READ_NFT_ITEM_METADATA, assetAddress],
    () => lib.readNFTCollectionMetadata(assetAddress!),
    {
      enabled: !!assetAddress && validateAddress(assetAddress),
      staleTime: Infinity,
      refetchInterval: undefined,
    }
  );
};

export const useReadNftItemMetadata = (assetAddress?: string) => {
  return useQuery<any>(
    [QueryKeys.READ_NFT_ITEM_METADATA, assetAddress],
    () => lib.readNFTItemMetadata(assetAddress!),
    {
      enabled: !!assetAddress && validateAddress(assetAddress),
      staleTime: Infinity,
      refetchInterval: undefined,
    }
  );
};

export const useReadNftItemMetadataCallback = () => {
  const queryClient = useQueryClient();

  return async (assetAddress: string) => {
    return queryClient.ensureQueryData(
      [QueryKeys.READ_NFT_ITEM_METADATA, assetAddress],
      () => lib.readNFTItemMetadata(assetAddress!)
    );
  };
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

export const useWalletNFTCollectionItemsQuery = (address?: string) => {
  const connectedWallet = useTonAddress();
  return useQuery(
    [QueryKeys.WALLET_NFT_COLLECTION_ITEMS],
    () => {
      return lib.getWalletNFTCollectionItems(address!, connectedWallet);
    },
    {
      enabled: !!address && validateAddress(address) && !!connectedWallet,
      staleTime: Infinity,
    }
  );
};

export const useGetWalletNFTCollectionItemsCallback = () => {
  const queryClient = useQueryClient();
  const connectedWallet = useTonAddress();

  return (address: string) =>
    queryClient.ensureQueryData([QueryKeys.WALLET_NFT_COLLECTION_ITEMS], () =>
      lib.getWalletNFTCollectionItems(address, connectedWallet)
    );
};

export const useVerifiedDaosQuery = () => {
  return useQuery(
    [QueryKeys.GET_VERIFIED_DAOS_LIST],
    ({ signal }) => {
      return api.getVerifiedDaosList(signal);
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useIsDaoVerified = (address?: string) => {
  const { data, dataUpdatedAt } = useVerifiedDaosQuery();

  return useMemo(() => {
    if (!address) return false;
    return data?.includes(address);
  }, [dataUpdatedAt, address]);
};

export const useGetTonVotingPower = () => {
  return useQuery(["useGetTonVotingPower"], async () => {
    const daos = await lib.getDaos();
    const proposals = (
      await Promise.allSettled(
        daos
          .map((dao) => dao.daoProposals)
          .flat()
          .map((address) => lib.getProposal(address))
      )
    )
      .map((proposal) => {
        if (proposal.status === "fulfilled") {
          return proposal.value;
        }
        return undefined;
      })
      .filter((proposal) => !!proposal) as Proposal[];

    let amount = 0;

    proposals.forEach((proposal) => {
      const type = getVoteStrategyType(
        proposal.metadata?.votingPowerStrategies
      );
      if (type === VotingPowerStrategyType.TonBalance) {
        const totalWeight =
          proposal.proposalResult.totalWeight ||
          proposal.proposalResult.totalWeights ||
          "0";
        const tonAmount = fromNano(totalWeight);

        amount += Number(tonAmount);
      }
    });
    return amount.toLocaleString();
  });
};
