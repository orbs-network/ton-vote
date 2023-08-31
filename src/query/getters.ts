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
} from "ton-vote-contracts-sdk";
import {
  getIsOneWalletOneVote,
  getProposalSymbol,
  getVoteStrategyType,
  isDaoWhitelisted,
  isProposalWhitelisted,
  Logger,
  nFormatter,
} from "utils";
import {
  FOUNDATION_DAO_ADDRESS,
  FOUNDATION_PROPOSALS_ADDRESSES,
  LATEST_FOUNDATION_PROPOSAL_ADDRESS,
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
import { LATEST_TF_PROPOSAL_DESCRIPTION } from "data/foundation/description";

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
        daoProposals = [...daoProposals, ...FOUNDATION_PROPOSALS_ADDRESSES];
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
      staleTime: Infinity,
    }
  );
};

interface ProposalQueryArgs {
  disabled?: boolean;
  isCustomEndpoint?: boolean;
}

const useGetProposalWithFallback = (proposalAddress: string) => {
  const analytics = useAnalytics();
  const queryClient = useQueryClient();
  const { getProposalUpdateMillis, removeProposalUpdateMillis } =
    useSyncStore();

  return async (key: QueryKey, maxLt?: string, signal?: AbortSignal) => {
    const getProposalFromContract = () =>
      contract.getProposal({ proposalAddress, maxLt });

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
    // failed to fetch proposal from server and contract

    if (!proposal) {
      proposal = queryClient.getQueryData<Proposal | undefined>(key);
    }

    if (proposal && proposalAddress === LATEST_FOUNDATION_PROPOSAL_ADDRESS) {
      proposal = {
        ...proposal,
        metadata: {
          ...proposal?.metadata,
          description: LATEST_TF_PROPOSAL_DESCRIPTION,
        },
      } as Proposal;
    }

    return proposal;
  };
};

export const useProposalQuery = (
  proposalAddress: string,
  args?: ProposalQueryArgs
) => {
  const clients = useGetClients().data;
  const votePersistStore = useVotePersistedStore();
  const { getProposalUpdateMillis, removeProposalUpdateMillis } =
    useSyncStore();
  const { isVoting } = useVoteStore();
  const key = [QueryKeys.PROPOSAL, proposalAddress];
  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const [error, setError] = useState(false);
  const route = useCurrentRoute();

  const getProposalWithFallback = useGetProposalWithFallback(proposalAddress);

  const config = useMemo(() => {
    return {
      refetchInterval: route === routes.proposal ? 15_000 : 30_000,
    };
  }, [route]);

  const queryClient = useQueryClient();

  return useQuery(
    key,
    async ({ signal }) => {
      if (!isWhitelisted) {
        throw new Error("Proposal not whitelisted");
      }

      if (BLACKLISTED_PROPOSALS.includes(proposalAddress)) {
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

      if (isVoting) {
        return queryClient.getQueryData<Proposal | undefined>(key) || null;
      }
      const currentProposal = queryClient.getQueryData<Proposal | undefined>(
        key
      );

      const votePersistValues = votePersistStore.getValues(proposalAddress!);

      // maxLtAfterVote is maxLt after voting
      const maxLtAfterVote = votePersistValues.maxLtAfterVote;

      const maxLt = maxLtAfterVote || currentProposal?.maxLt;

      const proposal = await getProposalWithFallback(key, maxLt, signal);

      if (!proposal) {
        // proposal not found in cache, throw error
        throw new Error("Proposal not found");
      }

      //  if proposal is up to date, return proposal, and clear local storage stored values

      const serverMaxLtUpToDate =
        Number(proposal?.maxLt) >= Number(maxLtAfterVote);
      const persistedResult = votePersistValues.results;
      const persistedVote = votePersistValues.vote;

      if (
        !maxLtAfterVote ||
        serverMaxLtUpToDate ||
        !persistedResult ||
        !persistedVote
      ) {
        votePersistStore.resetValues(proposalAddress!);

        return proposal;
      }

      Logger(
        `server proposal is not up to date, getting results and vote from local storage, proposal maxLt: ${proposal?.maxLt}, latestMaxLtAfterTx: ${maxLtAfterVote}`
      );

      // if maxLtAfterVote greater then proposal maxLt, that means that user voted, and
      // we need to get his vote and proposal result from local storage, because server is not up to date

      const filteredVotes = _.filter(
        proposal.votes,
        (it) => it.address !== persistedVote.address
      );

      return {
        ...proposal,
        proposalResult: persistedResult,
        votes: [persistedVote, ...filteredVotes],
      };
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
      refetchInterval: error
        ? 0
        : isWhitelisted
        ? config.refetchInterval
        : undefined,
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
