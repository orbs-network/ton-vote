import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  releaseMode,
  QueryKeys,
  IS_DEV,
  PROD_TEST_DAOS,
  REFETCH_INTERVALS,
  BLACKLISTED_PROPOSALS,
} from "config";
import { Dao, Proposal, Vote } from "types";
import _ from "lodash";
import {
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
  isSameAddress,
  isSameVoteChoice,
  Logger,
  nFormatter,
  normalizeTonAddress,
} from "utils";
import {
  FOUNDATION_DAO_ADDRESS,
  FOUNDATION_PROPOSALS_ADDRESSES,
} from "data/foundation/data";
import {
  useSyncStore,
  useVotePersistedStore,
  useVoteStore,
  useVotingPowerPersistedStore,
  useDaoRolesDisplayPersistedStore,
} from "store";
import { contract } from "contract";
import { useCurrentRoute, useDevFeatures } from "hooks/hooks";
import { Address, fromNano } from "ton-core";
import { mock } from "mock/mock";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import {
  getIsServerUpToDate,
  useDaoNewProposals,
  useIsDaosUpToDate,
  useNewDaoAddresses,
} from "./hooks";
import { api } from "api";
import { useMemo, useState } from "react";
import { routes } from "consts";
import { lib } from "lib";
import { useAnalytics } from "analytics";
import { getProposalDescription } from "data/foundation/proposals-descriptions";
import { applyLocalProposalMetadata } from "data/proposals-metadata";
import { useLocation } from "react-router-dom";
import {
  getResultWithClientV2Fallback,
  getResultWithClientV4Fallback,
} from "rpc";

const PINNED_DAO_ADDRESSES = [
  "EQDQvywF226NXojPky_9gwbCz0FPoygqY11bGl03SONNBs5V",
  FOUNDATION_DAO_ADDRESS,
];

const toNonBounceableAddress = (address: string) => {
  try {
    return Address.parse(address).toString({ bounceable: false });
  } catch (error) {
    return address;
  }
};

const getDisplayedDaoRoleAddress = (storedAddress: string | undefined, address: string) => {
  return storedAddress && isSameAddress(storedAddress, address)
    ? storedAddress
    : toNonBounceableAddress(address);
};

export const useRegistryStateQuery = () => {
  return useQuery(
    [QueryKeys.REGISTRY_STATE],
    async () => {
      const result = await getResultWithClientV2Fallback({
        request: (clientV2) => getRegistryState(clientV2, releaseMode),
        logPrefix: "Fetching registry state",
      });

      return {
        ...result,
        deployAndInitDaoFee: result
          ? fromNano(result!.deployAndInitDaoFee)
          : "",
      };
    }
  );
};

export const useDaoStateQuery = (daoAddress?: string) => {
  return useQuery(
    [QueryKeys.DAO_STATE, daoAddress],
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
      const result = await getResultWithClientV2Fallback({
        request: (clientV2) => getDaoState(clientV2, daoAddress!),
        logPrefix: `Fetching DAO state ${daoAddress}`,
      });
      return {
        ...result,
        fwdMsgFee: fromNano(result!.fwdMsgFee),
      };
    },
    {
      enabled: !!daoAddress,
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

      const pinnedDaos = _.compact(
        PINNED_DAO_ADDRESSES.map((daoAddress) => {
          const daoIndex = _.findIndex(result, (dao) =>
            isSameAddress(dao.daoAddress, daoAddress)
          );

          return daoIndex >= 0 ? result.splice(daoIndex, 1)[0] : undefined;
        })
      );

      let allDaos = [...pinnedDaos, ...result];

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
  const storedDaoRoles = useDaoRolesDisplayPersistedStore(
    (state) => state.roles[daoAddress]
  );
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
      const throwIfAborted = () => {
        if (signal?.aborted) {
          throw new Error("DAO request canceled");
        }
      };

      if (!isWhitelisted) {
        throw new Error("DAO not whitelisted");
      }

      throwIfAborted();

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
          throwIfAborted();
          dao = await getDaoFromContract();
        } else {
          removeDaoUpdateMillis(daoAddress!);
        }
      } catch (error) {
        throwIfAborted();
        analytics.getDaoFromContractFailed(daoAddress!, error);
      }

      if (!dao) {
        try {
          throwIfAborted();
          dao = await api.getDao(daoAddress!, signal);
        } catch (error) {
          throwIfAborted();
          analytics.getDaoFromServerFailed(daoAddress!, error);
        }
      }
      
      if (!dao) {
        
        try {
          throwIfAborted();
          dao = await getDaoFromContract();
        } catch (error) {
          throwIfAborted();
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
        daoProposals = _.uniq([
          ...daoProposals,
          ...FOUNDATION_PROPOSALS_ADDRESSES,
        ]);
      }
      const daoRoles = {
        owner: getDisplayedDaoRoleAddress(
          storedDaoRoles?.owner,
          dao.daoRoles.owner
        ),
        proposalOwner: getDisplayedDaoRoleAddress(
          storedDaoRoles?.proposalOwner,
          dao.daoRoles.proposalOwner
        ),
      };

      return {
        ...dao,
        daoRoles,
        daoProposals,
      };
    },
    {
      staleTime: config.staleTime,
      refetchInterval:
        isWhitelisted
          ? config.refetchInterval
          : undefined,
      enabled: !!daoAddress,
      retry: false,
    }
  );
};

const getConnectedWalletVotingPowerResult = (
  proposal: Proposal | null | undefined,
  votingPower: string
) => {
  const symbol = getProposalSymbol(proposal?.metadata?.votingPowerStrategies);

  if (getIsOneWalletOneVote(proposal?.metadata?.votingPowerStrategies)) {
    return {
      votingPower,
      votingPowerText: `${nFormatter(Number(votingPower))} ${symbol}`,
    };
  }

  return {
    votingPowerText: `${nFormatter(Number(fromNano(votingPower)))} ${symbol}`,
    votingPower,
  };
};

export const useConnectedWalletVotingPowerQuery = (
  proposal?: Proposal | null,
  proposalAddress?: string,
  disabled?: boolean
) => {
  const connectedWallet = useTonAddress();
  const votingPowerStore = useVotingPowerPersistedStore();
  return useQuery(
    [QueryKeys.SIGNLE_VOTING_POWER, connectedWallet, proposalAddress],
    async ({ signal }) => {
      const walletAddress = normalizeTonAddress(connectedWallet);
      const cachedVotingPower = votingPowerStore.getVotingPower(
        proposalAddress!,
        walletAddress
      );

      if (cachedVotingPower !== undefined) {
        return getConnectedWalletVotingPowerResult(proposal, cachedVotingPower);
      }

      const allNftHolders = await lib.getAllNFTHolders(
        proposalAddress!,
        proposal?.metadata!,
        signal
      );
      Logger(`Fetching voting power for account: ${connectedWallet}`);

      const strategy = getVoteStrategyType(
        proposal?.metadata?.votingPowerStrategies
      );
      const result = await getResultWithClientV4Fallback({
        request: (clientV4) =>
          getSingleVoterPower(
            clientV4,
            connectedWallet!,
            proposal?.metadata!,
            strategy,
            allNftHolders
          ),
        shouldFallback: (votingPower) => votingPower === "0" || !votingPower,
        logPrefix: `Fetching voting power for account ${connectedWallet}`,
      });

      if (result) {
        votingPowerStore.setVotingPower(
          proposalAddress!,
          walletAddress,
          result
        );
      }

      return getConnectedWalletVotingPowerResult(proposal, result);
    },
    {
      enabled:
        !!connectedWallet && !!proposal && !!proposalAddress && !disabled,
      staleTime: Infinity,
    }
  );
};

interface ProposalQueryArgs {
  disabled?: boolean;
  isCustomEndpoint?: boolean;
}

const getMatchingServerVote = (
  proposal: Proposal,
  persistedVote?: Vote
) => {
  if (!persistedVote) return;

  return _.find(
    proposal.votes,
    (vote) =>
      isSameAddress(vote.address, persistedVote.address) &&
      isSameVoteChoice(vote.vote, persistedVote.vote)
  );
};

const normalizeProposalResultForCompare = (result?: Proposal["proposalResult"]) => {
  if (!result) return;

  const { totalWeight, totalWeights, ...choices } = result;
  const normalized = _.mapValues(choices, (value) => {
    if (_.isNil(value) || _.isNaN(value)) return "0";

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? String(value) : String(numericValue);
  });
  const total = totalWeights ?? totalWeight;

  if (total !== undefined) {
    const numericTotal = Number(total);
    normalized.totalWeights = Number.isNaN(numericTotal)
      ? String(total)
      : String(numericTotal);
  }

  return normalized;
};

const areProposalResultsEqual = (
  resultA?: Proposal["proposalResult"],
  resultB?: Proposal["proposalResult"]
) => {
  return _.isEqual(
    normalizeProposalResultForCompare(resultA),
    normalizeProposalResultForCompare(resultB)
  );
};

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

    if (!proposal) {
      return proposal;
    }
    
    const metadata = proposal?.metadata
      ? ({
          ...proposal.metadata,
          description: getProposalDescription(
            proposalAddress!,
            proposal.metadata.description
          ),
        } as Proposal["metadata"])
      : undefined;

    proposal = {
      ...proposal,
      metadata: applyLocalProposalMetadata(proposalAddress!, metadata),
    } as Proposal;
    return proposal;
  };
};

export const useProposalQuery = (
  proposalAddress: string,
  args?: ProposalQueryArgs
) => {
  const votePersistStore = useVotePersistedStore();
  const { getProposalUpdateMillis, removeProposalUpdateMillis } =
    useSyncStore();
  const { isVoting } = useVoteStore();
  const key = [QueryKeys.PROPOSAL, proposalAddress];
  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const [error, setError] = useState(false);
  const route = useCurrentRoute();
  const { pathname } = useLocation();
  const isDirectProposalPage = pathname.includes("/proposal/");

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

      if (
        BLACKLISTED_PROPOSALS.includes(proposalAddress) &&
        !isDirectProposalPage
      ) {
        throw new Error("Proposal not found");
      }
      const mockProposal = mock.getMockProposal(proposalAddress!);
      if (mockProposal) {
        return mockProposal;
      }

      if (FOUNDATION_PROPOSALS_ADDRESSES.includes(proposalAddress!)) {
        const foundationProposals = await (
          await import("../data/foundation/data")
        ).getFoundationProposals();
        const foundationProposal = foundationProposals[proposalAddress!];
        if (foundationProposal) {
          return foundationProposal;
        }
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
      const serverVote = getMatchingServerVote(proposal, persistedVote);
      const serverResultsMatchPersisted = areProposalResultsEqual(
        proposal.proposalResult,
        persistedResult
      );
      const serverHasPersistedVoteAndResults =
        !!serverVote && serverResultsMatchPersisted;

      if (
        !maxLtAfterVote ||
        serverMaxLtUpToDate ||
        serverHasPersistedVoteAndResults ||
        !persistedResult ||
        !persistedVote
      ) {
        if (serverHasPersistedVoteAndResults && !serverMaxLtUpToDate) {
          Logger(
            `server proposal already includes persisted vote and results, clearing local storage fallback, proposal maxLt: ${proposal?.maxLt}, latestMaxLtAfterTx: ${maxLtAfterVote}`
          );
        }
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
        (it) => !isSameAddress(it.address, persistedVote.address)
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
      onSuccess: () => {
        setError(false);
      },
      refetchOnReconnect: false,
      enabled: !!proposalAddress && !args?.disabled,
      staleTime: Infinity,
      refetchInterval: error
        ? false
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
