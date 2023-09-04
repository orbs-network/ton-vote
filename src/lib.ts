import { api } from "api";
import { contract } from "contract";
import * as SDK from "ton-vote-contracts-sdk";
import {
  getIsOneWalletOneVote,
  getProposalSymbol,
  getVoteStrategyType,
  isDaoWhitelisted,
  isNftProposal,
  isProposalBlacklisted,
  Logger,
  nFormatter,
} from "utils";
import retry from "async-retry";
import { fromNano } from "ton";
import _ from "lodash";
import {
  getClientV2,
  getClientV4,
  getDaoMetadata,
  getSingleVoterPower,
} from "ton-vote-contracts-sdk";
import { Dao, Endpoints, Proposal, ProposalResults } from "types";
import { mock } from "mock/mock";
import { useNewDataStore, useSyncStore, useVotePersistedStore } from "store";
import { getIsServerUpToDate } from "query/hooks";
import {
  FOUNDATION_DAO_ADDRESS,
  FOUNDATION_PROPOSALS_ADDRESSES,
  LATEST_FOUNDATION_PROPOSAL_ADDRESS,
} from "./data/foundation/data";
import { BLACKLISTED_PROPOSALS, IS_DEV } from "config";

const getAllNFTHolders = async (
  proposalAddress: string,
  metadata: SDK.ProposalMetadata,
  signal?: AbortSignal
) => {
  if (!isNftProposal(metadata.votingPowerStrategies)) {
    return {} as { [key: string]: string[] };
  }
  let nftItemsHolders;

  try {
    nftItemsHolders = await api.getAllNftHolders(proposalAddress, signal);
  } catch (error) {}

  if (!_.isEmpty(nftItemsHolders)) {
    return nftItemsHolders;
  }

  return contract.getAllNftHolders(metadata);
};

const readJettonMetadata = (address: string) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Jetton metadata readed from contract, attempt: ${attempt}, address: ${address}`
    );
    const clientV2 = await SDK.getClientV2();
    const result = await SDK.readJettonWalletMetadata(clientV2, address);

    if (_.isEmpty(result)) {
      throw new Error("Empty result");
    }
    return result;
  };
  return retry(promise, { retries: 5 });
};

const getProposal = async (
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
    await import("./data/foundation/data")
  ).getFoundationProposals();
  const foundationProposal = foundationProposals[proposalAddress!];
  if (foundationProposal) {
    return foundationProposal;
  }
  const votePersistValues = useVotePersistedStore
    .getState()
    .getValues(proposalAddress!);
  // maxLtAfterVote is maxLt after voting
  const maxLtAfterVote = votePersistValues.maxLtAfterVote;

  const getProposalFromContract = () => {
    return contract.getProposal({
      proposalAddress,
      maxLt: maxLtAfterVote || currentData?.maxLt,
    });
  };

  const isMetadataUpToDateInServer = await getIsServerUpToDate(
    useSyncStore.getState().getProposalUpdateMillis(proposalAddress)
  );

  // if updated proposal metadata, and sever is not up to date, get proposal from contract
  if (!isMetadataUpToDateInServer) {
    return getProposalFromContract();
  } else {
    useSyncStore.getState().removeProposalUpdateMillis(proposalAddress);
  }

  let proposal;

  // try to fetch proposal from server
  try {
    proposal = await api.getProposal(proposalAddress!, signal);
  } catch (error) {}

  // try to fetch proposal from contract
  if (!proposal) {
    try {
      proposal = await getProposalFromContract();
    } catch (error) {}
  }

  // failed to fetch proposal from server and contract, try to return current data from cache
  if (!proposal) {
    proposal = currentData;
  }

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (proposal && proposalAddress === LATEST_FOUNDATION_PROPOSAL_ADDRESS) {
    const description = (await import("./data/foundation/description"))
      .LATEST_TF_PROPOSAL_DESCRIPTION;
    proposal = {
      ...proposal,
      metadata: {
        ...proposal?.metadata,
        description,
      },
    } as Proposal;
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
  useVotePersistedStore.getState().resetValues(proposalAddress!);

  return proposal;
};

const readNFTItemMetadata = (address: string) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `NFT item metadata readed from contract, attempt: ${attempt}, address: ${address}`
    );
    const clientV2 = await SDK.getClientV2();
    const result = await SDK.readNftItemMetadata(clientV2, address);

    if (_.isEmpty(result)) {
      throw new Error("Empty result");
    }
    return result;
  };
  return retry(promise, { retries: 3 });
};

const getDao = async (daoAddress: string, signal?: AbortSignal) => {
  if (!isDaoWhitelisted(daoAddress)) {
    throw new Error("DAO not whitelisted");
  }

  const mockDao = mock.isMockDao(daoAddress!);
  if (mockDao) {
    return {
      ...mockDao,
      daoProposals: mock.proposalAddresses,
    };
  }

  const metadataLastUpdate = useSyncStore
    .getState()
    .getDaoUpdateMillis(daoAddress!);

  const isMetadataUpToDate = await getIsServerUpToDate(metadataLastUpdate);

  const getDaoFromContract = () => contract.getDao(daoAddress);

  let dao;
  if (!isMetadataUpToDate) {
    dao = await getDaoFromContract();
  } else {
    useSyncStore.getState().removeDaoUpdateMillis(daoAddress!);
  }

  if (!dao) {
    try {
      dao = await api.getDao(daoAddress!, signal);
    } catch (error) {}
  }

  if (!dao) {
    try {
      dao = await getDaoFromContract();
    } catch (error) {}
  }

  if (!dao) {
    throw new Error("DAO not found");
  }

  const addProposalFromLocalStorage = (
    daoAddress: string,
    proposals: string[]
  ) => {
    const newDaoPoposals = useNewDataStore.getState().proposals[daoAddress];

    // if no new proposals reutrn current proposals
    if (!_.size(newDaoPoposals)) return proposals;
    _.forEach(newDaoPoposals, (newDaoProposal) => {
      // if server already return new proposal, delete from local storage
      if (proposals.includes(newDaoProposal)) {
        useNewDataStore.getState().removeProposal(daoAddress, newDaoProposal);
      } else {
        // if server dont return new proposal, add to proposals
        proposals.push(newDaoProposal);
      }
    });

    return _.uniq(proposals);
  };

  const proposals = addProposalFromLocalStorage(daoAddress!, dao.daoProposals);
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
};

const readNFTCollectionMetadata = (address: string) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `NFT collection metadata readed from contract, attempt: ${attempt}, address: ${address}`
    );
    const clientV2 = await SDK.getClientV2();
    const result = await SDK.readNftCollectionMetadata(clientV2, address);

    if (_.isEmpty(result)) {
      throw new Error("Empty result");
    }
    return result;
  };
  return retry(promise, { retries: 3 });
};

const getWalletNFTCollectionItems = (
  collectionAddr: string,
  connectedWallet?: string
) => {
  if (!connectedWallet) {
    console.error("connectedWallet is undefined");
    return [];
  }
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Get wallet nft items from collection, attempt: ${attempt}, address: ${collectionAddr}`
    );
    const clientV4 = await SDK.getClientV4();
    const result = await SDK.getAllNftHoldersFromCollectionAddr(
      clientV4,
      collectionAddr
    );
    return result[connectedWallet as any] || [];
  };
  return retry(promise, { retries: 3 });
};

const getClients = async () => {
  return {
    clientV2: await SDK.getClientV2(),
    clientV4: await SDK.getClientV4(),
  };
};

export const getIsDaosUpToDate = async (daos: Dao[]) => {
  const promise = await Promise.allSettled(
    _.map(daos, async (dao): Promise<Dao> => {
      const metadataLastUpdate = useSyncStore
        .getState()
        .getDaoUpdateMillis(dao.daoAddress);
      let metadataArgs = dao.daoMetadata.metadataArgs;
      const isServerUpToDate = await getIsServerUpToDate(metadataLastUpdate);

      if (!isServerUpToDate) {
        metadataArgs = await getDaoMetadata(
          await getClientV2(),
          dao.daoMetadata.metadataAddress
        );
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

export const handleNewDaoAddresses = async (daos: Dao[]) => {
  const newDaosAddresses = useNewDataStore.getState().daos;

  if (_.size(newDaosAddresses)) {
    const addresses = _.map(daos, (it) => it.daoAddress);
    const client = await getClientV2();

    let promise = Promise.allSettled(
      _.map(newDaosAddresses, async (newDaoAddress) => {
        if (addresses.includes(newDaoAddress)) {
          useNewDataStore.getState().removeDao(newDaoAddress);
        } else {
          Logger(`New DAO: ${newDaoAddress}`);

          return contract.getDao(newDaoAddress, client);
        }
      })
    );

    const newDaosMap = await promise;

    const newDaos = _.compact(
      newDaosMap.map((it, index) => {
        if (it.status === "fulfilled") {
          return it.value;
        } else {
          useNewDataStore.getState().removeDao(newDaosAddresses[index]);
        }
      })
    );
    daos = [daos[0], ...newDaos, ...daos.slice(1)];
  }
  return daos;
};

const getDaos = async (signal?: AbortSignal) => {
  const payload = (await api.getDaos(signal)) || [];
  const prodDaos = await getIsDaosUpToDate(payload);

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
    foundationDao.daoProposals = _.concat(
      foundationDao.daoProposals,
      FOUNDATION_PROPOSALS_ADDRESSES
    );
    allDaos = [foundationDao, ...allDaos];
  }
  return allDaos;
};

const getWalletVotingPower = async ({
  connectedWallet,
  proposal,
  proposalAddress,
  signal,
}: {
  connectedWallet: string;
  proposal?: Proposal | null;
  proposalAddress?: string;
  signal?: AbortSignal;
}) => {
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
    await getClientV4(),
    connectedWallet!,
    proposal?.metadata!,
    strategy,
    allNftHolders
  );

  const symbol = getProposalSymbol(proposal?.metadata?.votingPowerStrategies);

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
};

const handleNulls = (result?: ProposalResults) => {
  const getValue = (value: any) => {
    if (_.isNull(value) || _.isNaN(value)) return 0;
    if (_.isString(value)) return Number(value);
    return value;
  };

  if (!result) return;
  _.forEach(result, (value, key) => {
    result[key] = getValue(value);
  });

  return result;
};

const compareProposalResults = async ({
  proposalAddress,
  endpoints,
  proposal,
}: {
  proposalAddress: string;
  endpoints?: Endpoints;
  proposal?: Proposal | null;
}) => {
  const clientV2 = await getClientV2(
    endpoints?.clientV2Endpoint,
    endpoints?.apiKey
  );
  const clientV4 = await getClientV4(endpoints?.clientV4Endpoint);

  // if user voted, we need to get transactions after his vote
  const maxLtAfterVote = useVotePersistedStore
    .getState()
    .getValues(proposalAddress).maxLtAfterVote;

  const maxLt = maxLtAfterVote || proposal?.maxLt || "";

  const contractState = await contract.getProposal({
    clientV2,
    clientV4,
    proposalAddress,
    metadata: proposal?.metadata,
    maxLt,
  });
  const currentResults = handleNulls(proposal?.proposalResult);
  const compareToResults = handleNulls(contractState?.proposalResult);

  if (!currentResults || !compareToResults) return false;

  const { totalWeight, totalWeights, ...currentResultsRest } = currentResults;

  const {
    totalWeight: totalWeight2,
    totalWeights: totalWeights2,
    ...compareToResultsRest
  } = compareToResults;

  const _currentResults = {
    ...currentResultsRest,
    totalWeight: totalWeight || totalWeights,
  };

  const _compareToResults = {
    ...compareToResultsRest,
    totalWeight: totalWeight2 || totalWeights2,
  };

  Logger({
    _currentResults,
    _compareToResults,
  });

  return _.isEqual(_currentResults, _compareToResults);
};

export const lib = {
  getAllNFTHolders,
  getClients,
  readJettonMetadata,
  readNFTItemMetadata,
  getWalletNFTCollectionItems,
  readNFTCollectionMetadata,
  getProposal,
  getDao,
  getDaos,
  getWalletVotingPower,
  compareProposalResults,
};
