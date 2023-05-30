import { useQuery } from "@tanstack/react-query";
import { releaseMode, QueryKeys, IS_DEV } from "config";
import { Dao, Proposal, ProposalStatus } from "types";
import _ from "lodash";
import {
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
  getDaoMetadata,
  getSingleVoterPower,
  getTransactions,
  ProposalMetadata,
  getDaoState,
  getRegistryState,
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
import {
  useNewDataStore,
  useProposalPersistedStore,
  useSyncStore,
  useVoteStore,
} from "store";
import { getDaoFromContract, lib } from "lib/lib";
import { api } from "api";
import { useDaoAddressFromQueryParam, useProposalAddress } from "hooks";
import { fromNano, Transaction } from "ton-core";
import { GetProposalArgs, ReactQueryConfig } from "./types";
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

  return useQuery(
    [QueryKeys.DAOS],
    async ({ signal }) => {
      const serverLastUpdate = await api.getUpdateTime();

      const payload = (await lib.getDaos(signal)) || [];
      const promise = await Promise.allSettled(
        _.map(payload, async (dao): Promise<Dao> => {
          const metadataLastUpdate = getDaoUpdateMillis(dao.daoAddress);
          let metadataArgs = dao.daoMetadata.metadataArgs;
          if (
            metadataLastUpdate &&
            !validateServerUpdateTime(serverLastUpdate, metadataLastUpdate)
          ) {
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
  _proposalAddress?: string,
  args?: GetProposalArgs
) => {
  const proposalAddressFromURL = useProposalAddress();

  const proposalAddress = _proposalAddress || proposalAddressFromURL;
  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const clients = useGetClients().data;
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistedStore();
  const { isVoting } = useVoteStore();

  return useQuery(
    [QueryKeys.PROPOSAL, proposalAddress],
    async ({ signal }) => {
      const isMockProposal = mock.getMockProposal(proposalAddress!);
      if (isMockProposal) {
        return isMockProposal;
      }
      const latestMaxLtAfterTx = !args?.ignoreMaxLt
        ? getLatestMaxLtAfterTx(proposalAddress!)
        : undefined;

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

      if (args?.validateServerMaxLt && latestMaxLtAfterTx) {
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

      return proposal;
    },
    {
      enabled:
        !!proposalAddress &&
        !!clients?.clientV2 &&
        !!clients.clientV4 &&
        !args?.disabled &&
        !isVoting,
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
