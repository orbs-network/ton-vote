import { api } from "api";
import { contract } from "contract";
import {
  ProposalMetadata,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { getVoteStrategyType, isNftProposal } from "utils";

const getAllNFTHolders = async (
  proposalAddress: string,
  metadata: ProposalMetadata,
  signal?: AbortSignal
) => {
  if (!isNftProposal(metadata.votingPowerStrategies)) {
    return {} as { [key: string]: number };
  }
  let nftItemsHolders;

  nftItemsHolders = await api.getAllNftHolders(proposalAddress, signal);

  if (nftItemsHolders) {
    return nftItemsHolders;
  }

  return contract.getAllNftHolders(metadata);
};

export const lib = {
  getAllNFTHolders,
};
