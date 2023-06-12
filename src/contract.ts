import _ from "lodash";
import { TonClient, TonClient4, Transaction } from "ton";
import * as TonVoteSDK from "ton-vote-contracts-sdk";
import {
  calcProposalResult,
  filterTxByTimestamp,
  getAllNftHolders,
  getAllVotes,
  getClientV2,
  getClientV4,
  getProposalMetadata,
  getSingleVoterPower,
  getTransactions,
  ProposalMetadata,
} from "ton-vote-contracts-sdk";
import { Dao, Proposal } from "types";
import { getVoteStrategyType, isNftProposal, Logger, parseVotes } from "utils";
import retry from "async-retry";
import { CONTRACT_RETRIES } from "config";

interface GetProposalArgs {
  clientV2?: TonClient;
  clientV4?: TonClient4;
  proposalAddress: string;
  metadata?: ProposalMetadata;
  maxLt?: string;
}

const getProposal = async (args: GetProposalArgs): Promise<Proposal | null> => {
  const { clientV2, clientV4, proposalAddress, maxLt } = args;

  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Fetching proposal from contract, address: ${proposalAddress}, attempt: ${attempt}`
    );
    try {
      let newMaxLt = undefined;

      const _clientV2 = clientV2 || (await getClientV2());
      const _clientV4 = clientV4 || (await getClientV4());

      const metadata =
        args.metadata ||
        (await getProposalMetadata(_clientV2, _clientV4, proposalAddress));
      let transactions: Transaction[];
      const result = await getTransactions(_clientV2, proposalAddress);
      newMaxLt = result.maxLt;
      if (maxLt) {
        transactions = filterTxByTimestamp(result.allTxns, maxLt);
      } else {
        transactions = result.allTxns;
      }

      const { votingPowerStrategies } = metadata;

      const nftItemsHolders = await _getAllNftHolders(metadata, _clientV4);

      const votingPower = await TonVoteSDK.getVotingPower(
        _clientV4,
        metadata,
        transactions,
        {},
        getVoteStrategyType(votingPowerStrategies),
        nftItemsHolders
      );

      const proposalResult = TonVoteSDK.getCurrentResults(
        transactions,
        votingPower,
        metadata
      );
      const votes = TonVoteSDK.getAllVotes(transactions, metadata);

      return {
        votingPower,
        proposalResult: proposalResult as any,
        votes: parseVotes(votes, votingPower),
        metadata,
        maxLt: newMaxLt,
        rawVotes: votes,
      };
    } catch (error) {
      Logger(error);
      if (attempt === CONTRACT_RETRIES + 1) {
        Logger("Failed to fetch proposal from contract");

        return null;
      }
      throw new Error("Failed to fetch proposal from contract");
    }
  };

  return retry(promise, { retries: CONTRACT_RETRIES });
};

interface GetProposalResultsAfterVoteArgs {
  proposalAddress: string;
  walletAddress: string;
  proposal: Proposal;
  nftItemsHolders: { [key: string]: number };
}

const getProposalResultsAfterVote = async (args: GetProposalResultsAfterVoteArgs) => {
  const { proposalAddress, walletAddress, proposal } = args;
  const metadata = proposal.metadata;

  const clientV2 = await getClientV2();
  const clientV4 = await getClientV4();
  const { allTxns, maxLt } = await getTransactions(
    clientV2,
    proposalAddress,
    proposal.maxLt
  );

  const userTx = _.find(allTxns, (tx) => {
    return tx.inMessage?.info.src?.toString() === walletAddress;
  });

  if (!userTx || !metadata) return;

  const nftItemsHolders =
    args.nftItemsHolders || (await getAllNftHolders(clientV4, metadata));

  const singleVotingPower = await getSingleVoterPower(
    clientV4,
    walletAddress,
    metadata,
    getVoteStrategyType(metadata.votingPowerStrategies),
    nftItemsHolders
  );

  const rawVotes = getAllVotes([userTx], metadata);
  const votingPower = proposal.votingPower || {};

  const votes = {
    ...proposal.rawVotes,
    [walletAddress]: rawVotes[walletAddress],
  };

  votingPower[walletAddress] = singleVotingPower;

  return {
    proposalResults: calcProposalResult(votes, votingPower),
    vote: parseVotes(rawVotes, votingPower)[0],
    maxLt,
  };
};

export const getDao = async (daoAddress: string, clientV2?: TonClient) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Fetching dao from contract, address ${daoAddress}, attempt: ${attempt}`
    );
    const client = clientV2 || (await getClientV2());

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
  };

  return retry(promise, { retries: CONTRACT_RETRIES });
};

const _getAllNftHolders = (
  metadata: ProposalMetadata,
  clientV4?: TonClient4
) => {
  if (!isNftProposal(metadata.votingPowerStrategies)) {
    return {} as { [key: string]: number };
  }
  const promise = async (bail: any, attempt: number) => {
    Logger(`Fetching all nft holders, attempt: ${attempt}`);
    const _clientV4 = clientV4 || (await getClientV4());
    return getAllNftHolders(_clientV4, metadata);
  };
  return retry(promise, { retries: CONTRACT_RETRIES });
};

export const contract = {
  getAllNftHolders: _getAllNftHolders,
  getProposal,
  getDao,
  getProposalResultsAfterVote,
};
