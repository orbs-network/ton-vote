import { api } from "api";
import { contract } from "contract";
import _ from "lodash";
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

export const lib = {
  getAllNFTHolders,
};
