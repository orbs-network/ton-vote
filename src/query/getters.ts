import { useQuery } from "@tanstack/react-query";
import { releaseMode, QueryKeys, IS_DEV, PROD_TEST_DAOS } from "config";
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
import { useSyncStore } from "store";
import { lib } from "lib/lib";
import { api } from "api";
import { useDevFeatures } from "hooks";
import { fromNano } from "ton-core";
import { mock } from "mock/mock";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import {
  getIsServerUpToDate,
  useDaoNewProposals,
  useDaoQueryConfig,
  useDaosQueryConfig,
  useGetContractState,
  useIsDaosUpToDate,
  useNewDaoAddresses,
} from "./logic";

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
  const config = useDaosQueryConfig();
  return useQuery(
    [QueryKeys.DAOS, devFeatures],
    async ({ signal }) => {
      const payload = (await lib.getDaos(signal)) || [];

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
  const config = useDaoQueryConfig();
  return useQuery<Dao>(
    [QueryKeys.DAO, daoAddress],
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

      const serverUpToDate = await getIsServerUpToDate(metadataLastUpdate);

      if (serverUpToDate) {
        removeDaoUpdateMillis(daoAddress!);
      }

      const dao = await lib.getDao(daoAddress!, !serverUpToDate, signal);
      const proposals = addNewProposals(daoAddress!, dao.daoProposals);
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
      staleTime: config.staleTime,
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
  disabled?: boolean
) => {
  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const clients = useGetClients().data;
  const getContractStateCallback = useGetContractState();

  return useQuery(
    [QueryKeys.PROPOSAL, proposalAddress],
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
        !disabled,
      staleTime: 30_000,
      retry: isWhitelisted ? 3 : false,
      refetchInterval: isWhitelisted ? 30_000 : undefined,
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
