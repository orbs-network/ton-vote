import _ from "lodash";
import { TonClient, TonClient4, Transaction } from "ton";
import * as TonVoteSDK from "ton-vote-contracts-sdk";
import {
  calcProposalResult,
  filterTxByTimestamp,
  getAllNftHolders,
  getAllVotes,
  getProposalMetadata,
  getSingleVoterPower,
  getTransactions,
  ProposalMetadata,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { Dao, Proposal } from "types";
import {
  getVoteStrategyType,
  isNftProposal,
  isSameAddress,
  Logger,
  parseVotes,
} from "utils";
import retry from "async-retry";
import { CONTRACT_RETRIES } from "config";
import { api } from "api";
import {
  getClientV2RpcEndpoints,
  getClientV4RpcEndpoints,
  getResultWithClientV2Fallback,
  getResultWithClientV4Fallback,
  RpcEndpoint,
} from "rpc";

interface GetProposalArgs {
  clientV2?: TonClient;
  clientV4?: TonClient4;
  clientV2Endpoints?: RpcEndpoint<TonClient>[];
  clientV4Endpoints?: RpcEndpoint<TonClient4>[];
  proposalAddress: string;
  metadata?: ProposalMetadata;
  maxLt?: string;
}

const getProposalWithClients = async (
  args: GetProposalArgs,
  clientV2: TonClient,
  clientV4: TonClient4
): Promise<Proposal> => {
  const { proposalAddress, maxLt } = args;
  let newMaxLt = undefined;

  const metadata =
    args.metadata ||
    (await getProposalMetadata(clientV2, clientV4, proposalAddress));
  const proposalType = getVoteStrategyType(metadata.votingPowerStrategies);
  let transactions: Transaction[];
  const result = await getTransactions(clientV2, proposalAddress);
  newMaxLt = result.maxLt;
  if (maxLt) {
    transactions = filterTxByTimestamp(result.allTxns, maxLt);
  } else {
    transactions = result.allTxns;
  }

  const { votingPowerStrategies } = metadata;

  const nftItemsHolders = await _getAllNftHolders(metadata, clientV4);

  let operatingValidatorsInfo = {};

  if (proposalType === VotingPowerStrategyType.TonBalanceWithValidators) {
    operatingValidatorsInfo = await api.geOperatingValidatorsInfo(
      proposalAddress
    );
  }

  const votingPower = await TonVoteSDK.getVotingPower(
    clientV4,
    metadata,
    transactions,
    {},
    getVoteStrategyType(votingPowerStrategies),
    nftItemsHolders,
    operatingValidatorsInfo
  );

  const proposalResult = TonVoteSDK.getCurrentResults(
    transactions,
    votingPower,
    metadata
  );

  proposalResult.totalWeight = proposalResult.totalWeights;
  const { totalWeights, ...rest } = proposalResult;
  const votes = TonVoteSDK.getAllVotes(transactions, metadata);

  return {
    votingPower,
    proposalResult: rest as any,
    votes: parseVotes(votes, votingPower),
    metadata,
    maxLt: newMaxLt,
    rawVotes: votes,
  };
};

const getProposal = async (args: GetProposalArgs): Promise<Proposal | null> => {
  const { clientV2, clientV4, proposalAddress } = args;

  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Fetching proposal from contract, address: ${proposalAddress}, attempt: ${attempt}`
    );
    try {
      return getResultWithClientV2Fallback({
        endpoints: args.clientV2Endpoints || getClientV2RpcEndpoints(clientV2),
        request: (clientV2) =>
          getResultWithClientV4Fallback({
            endpoints:
              args.clientV4Endpoints || getClientV4RpcEndpoints(clientV4),
            request: (clientV4) =>
              getProposalWithClients(args, clientV2, clientV4),
            logPrefix: `Fetching proposal ${proposalAddress} V4`,
          }),
        logPrefix: `Fetching proposal ${proposalAddress} V2`,
      });
    } catch (error) {
      Logger(error);
      if (attempt === CONTRACT_RETRIES + 1) {
        Logger("Failed to fetch proposal from contract");
      }
      throw new Error(error instanceof Error ? error.message : "");
    }
  };

  return retry(promise, { retries: CONTRACT_RETRIES });
};

interface GetProposalResultsAfterVoteArgs {
  proposalAddress: string;
  walletAddress: string;
  proposal: Proposal;
}

const getProposalResultsAfterVote = async (
  args: GetProposalResultsAfterVoteArgs
) => {
  const { proposalAddress, walletAddress, proposal } = args;
  const metadata = proposal.metadata;

  const { allTxns, maxLt } = await getResultWithClientV2Fallback({
    request: (clientV2) =>
      getTransactions(clientV2, proposalAddress, proposal.maxLt),
    logPrefix: `Fetching transactions after vote ${proposalAddress}`,
  });

  const userTx = _.find(allTxns, (tx) => {
    return isSameAddress(tx.inMessage?.info.src?.toString(), walletAddress);
  });

  if (!userTx || !metadata) return;

  const { singleVotingPower } = await getResultWithClientV4Fallback({
    request: async (clientV4) => {
      const nftItemsHolders = await getAllNftHolders(clientV4, metadata);
      return {
        singleVotingPower: await getSingleVoterPower(
          clientV4,
          walletAddress,
          metadata,
          getVoteStrategyType(metadata.votingPowerStrategies),
          nftItemsHolders
        ),
      };
    },
    logPrefix: `Fetching voting power after vote ${proposalAddress}`,
  });

  const rawVotes = getAllVotes([userTx], metadata);
  const votingPower = proposal.votingPower || {};

  const votes = {
    ...proposal.rawVotes,
    [walletAddress]: rawVotes[walletAddress],
  };

  votingPower[walletAddress] = singleVotingPower;

  return {
    proposalResults: calcProposalResult(
      votes,
      votingPower,
      proposal.metadata?.votingSystem!
    ),
    vote: parseVotes(rawVotes, votingPower)[0],
    maxLt,
  };
};

export const getDao = async (daoAddress: string, clientV2?: TonClient) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Fetching dao from contract, address ${daoAddress}, attempt: ${attempt}`
    );
    return getResultWithClientV2Fallback({
      endpoints: getClientV2RpcEndpoints(clientV2),
      request: async (client) => {
        const daoState = await TonVoteSDK.getDaoState(client, daoAddress);

        const metadataArgs = await TonVoteSDK.getDaoMetadata(
          client,
          daoState.metadata
        );

        const daoFromContract: Dao = {
          daoAddress: daoAddress,
          daoRoles: {
            owner: daoState.owner,
            proposalOwner: daoState.proposalOwner,
          },
          daoMetadata: {
            metadataAddress: "",
            metadataArgs,
          },
          daoId: daoState.daoIndex,
          daoProposals:
            (await TonVoteSDK.getDaoProposals(client, daoAddress))
              .proposalAddresses || [],
        };
        return daoFromContract;
      },
      logPrefix: `Fetching DAO ${daoAddress}`,
    });
  };

  return retry(promise, { retries: CONTRACT_RETRIES });
};

const _getAllNftHolders = (
  metadata: ProposalMetadata,
  clientV4?: TonClient4
) => {
  if (!isNftProposal(metadata.votingPowerStrategies)) {
    return {} as { [key: string]: string[] };
  }
  const promise = async (bail: any, attempt: number) => {
    Logger(`Fetching all nft holders, attempt: ${attempt}`);
    return getResultWithClientV4Fallback({
      endpoints: getClientV4RpcEndpoints(clientV4),
      request: (clientV4) => getAllNftHolders(clientV4, metadata),
      logPrefix: "Fetching all NFT holders",
    });
  };
  return retry(promise, { retries: CONTRACT_RETRIES });
};

export const contract = {
  getAllNftHolders: _getAllNftHolders,
  getProposal,
  getDao,
  getProposalResultsAfterVote,
};
