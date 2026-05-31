import _ from "lodash";
import { IS_DEV } from "config";
import { Address, fromNano } from "ton";
import { calcProposalResult } from "ton-vote-contracts-sdk";
import { Proposal, RawVote, RawVotes, Vote, VotingPower } from "types";

export const normalizeTonAddress = (address?: string | null) => {
  if (!address) return "";

  try {
    return Address.parse(address).toRawString();
  } catch (error) {
    return address.trim();
  }
};

export const isSameAddress = (
  addressA?: string | null,
  addressB?: string | null
) => {
  const normalizedA = normalizeTonAddress(addressA);
  const normalizedB = normalizeTonAddress(addressB);

  return !!normalizedA && !!normalizedB && normalizedA === normalizedB;
};

const parseVotes = (rawVotes: RawVotes, votingPower: VotingPower) => {
  const votes: Vote[] = _.map(rawVotes, (vote: RawVote, address: string) => {
    const power = votingPower[address];

    return {
      address,
      vote: vote.vote,
      votingPower: power ? fromNano(power) : "0",
      timestamp: vote.timestamp,
      hash: vote.hash,
    };
  });

  return _.orderBy(votes, "timestamp", ["desc", "asc"]);
};

const getNextMaxLt = (maxLt?: string) => {
  try {
    return (BigInt(maxLt || "0") + 1n).toString();
  } catch (error) {
    return maxLt || "1";
  }
};

const omitAddress = <T,>(values: { [key: string]: T } = {}, address: string) =>
  _.omitBy(values, (_value, key) => isSameAddress(key, address));

const getVotingPowerForWallet = (
  proposal: Proposal,
  walletAddress: string,
  cachedVotingPower?: string
) => {
  if (cachedVotingPower) return cachedVotingPower;

  return _.find(
    proposal.votingPower,
    (_votingPower, address) => isSameAddress(address, walletAddress)
  );
};

export const getManualVoteSuccessValues = ({
  proposal,
  proposalAddress,
  walletAddress,
  vote,
  cachedVotingPower,
}: {
  proposal: Proposal;
  proposalAddress: string;
  walletAddress: string;
  vote: string;
  cachedVotingPower?: string;
}) => {
  if (!proposal.metadata || !walletAddress) {
    throw new Error("Failed to update vote locally");
  }

  const votingPower = getVotingPowerForWallet(
    proposal,
    walletAddress,
    cachedVotingPower
  );

  if (!votingPower) {
    throw new Error("Voting power not found");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const rawVote = {
    vote: vote.toLowerCase(),
    timestamp,
    hash: "",
  };
  const rawVotes: RawVotes = {
    ...omitAddress(proposal.rawVotes || {}, walletAddress),
    [walletAddress]: rawVote,
  };
  const votingPowerMap: VotingPower = {
    ...omitAddress(proposal.votingPower || {}, walletAddress),
    [walletAddress]: votingPower,
  };
  const proposalResults = calcProposalResult(
    rawVotes,
    votingPowerMap,
    proposal.metadata.votingSystem
  );
  const parsedVote = parseVotes({ [walletAddress]: rawVote }, votingPowerMap);

  if (IS_DEV || import.meta.env.DEV) {
    console.log(`vote success locally updated proposal ${proposalAddress}`);
  }

  return {
    proposalResults,
    maxLt: getNextMaxLt(proposal.maxLt),
    rawVotes,
    votingPower: votingPowerMap,
    vote: parsedVote[0],
  };
};
