import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  releaseMode,
  QueryKeys,
  IS_DEV,
  PROD_TEST_DAOS,
  REFETCH_INTERVALS,
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
  getVoteStrategyType,
  isDaoWhitelisted,
  isProposalWhitelisted,
  Logger,
  nFormatter,
} from "utils";
import {
  FOUNDATION_DAO_ADDRESS,
  FOUNDATION_PROPOSALS,
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
import { useMemo, useState } from "react";
import { routes } from "consts";
import { lib } from "lib";

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
      staleTime: config.staleTime,
    }
  );
};

export const useDaoQuery = (daoAddress: string) => {
  const addNewProposals = useDaoNewProposals();
  const isWhitelisted = isDaoWhitelisted(daoAddress);
  const { getDaoUpdateMillis, removeDaoUpdateMillis } = useSyncStore();

  const route = useCurrentRoute();

  const config = useMemo(() => {
    return {
      staleTime: route === routes.proposal ? Infinity : 10_000,
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
      if (!isMetadataUpToDate) {
        dao = await getDaoFromContract();
      } else {
        removeDaoUpdateMillis(daoAddress!);
        dao = await api.getDao(daoAddress!, signal);
        if (!dao) {
          // fallback
          dao = await getDaoFromContract();
        }
      }

      // try to return dao from cache
      if (!dao) {
        return queryClient.getQueryData<Dao>(key) || null;
      }

      const proposals = addNewProposals(daoAddress!, dao.daoProposals);
      const daoProposals = IS_DEV
        ? _.concat(proposals, mock.proposalAddresses)
        : proposals;
      return {
        ...dao,
        daoProposals:
          daoAddress === FOUNDATION_DAO_ADDRESS
            ? FOUNDATION_PROPOSALS_ADDRESSES
            : daoProposals,
      };
    },
    {
      staleTime: Infinity,
      refetchInterval: isWhitelisted ? config.refetchInterval : undefined,
      enabled: !!daoAddress,
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

      let result = '';

      try {
        result = await getSingleVoterPower(
          clients!.clientV4,
          connectedWallet!,
          proposal?.metadata!,
          strategy,
          allNftHolders
        );
      } catch (error) {
        console.log(error);
      }


          console.log(strategy);

      return nFormatter(Number(fromNano(result)));
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

  const queryClient = useQueryClient();

  return useQuery(
    key,
    async ({ signal }) => {
      if (!isWhitelisted) {
        throw new Error("Proposal not whitelisted");
      }
      const mockProposal = mock.getMockProposal(proposalAddress!);
      if (mockProposal) {
        return mockProposal;
      }
      const foundationProposal = FOUNDATION_PROPOSALS[proposalAddress!];
      if (foundationProposal) {
        return foundationProposal;
      }

      const currentProposal = queryClient.getQueryData<Proposal | undefined>(
        key
      );

      const votePersistValues = votePersistStore.getValues(proposalAddress!);

      // maxLtAfterVote is maxLt after voting
      const maxLtAfterVote = votePersistValues.maxLtAfterVote;

      const maxLt = maxLtAfterVote || currentProposal?.maxLt;

      const getProposalFromContract = () =>
        contract.getProposal({ proposalAddress, maxLt });

      const isMetadataUpToDateInServer = await getIsServerUpToDate(
        getProposalUpdateMillis(proposalAddress)
      );

      // if updated proposal metadata, and sever is not up to date, get proposal from contract
      if (!isMetadataUpToDateInServer) {
        return getProposalFromContract();
      } else {
        removeProposalUpdateMillis(proposalAddress);
      }
      let proposal;

      // try to fetch proposal from server
      proposal = await api.getProposal(proposalAddress!, signal);
      if (!proposal) {
        // fetch from contract if proposal is not found in server
        proposal = await getProposalFromContract();
      }

      // failed to fetch proposal from server and contract
      if (!proposal) {
        // try to return proposal from cache
        if (currentProposal) return currentProposal;

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
        console.log(error);

        setError(true);
      },
      enabled:
        !!proposalAddress &&
        !!clients?.clientV2 &&
        !!clients.clientV4 &&
        !args?.disabled &&
        !isVoting,
      staleTime: Infinity,
      refetchInterval: error
        ? undefined
        : isWhitelisted
        ? REFETCH_INTERVALS.proposal
        : undefined,
      retry: false,
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
