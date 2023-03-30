import { useAppPersistedStore } from "store";
import { TonClient, TonClient4 } from "ton";
import { Address } from "ton-core";
import * as TonVoteContract from "ton-vote-npm";
import { ProposalMetadata } from "ton-vote-npm";
import { ProposalState, RawVotes } from "types";
import { parseVotes } from "utils";

export const getContractState = async (
  clientV2: TonClient,
  clientV4: TonClient4,
  proposalAddress: string,
  proposalInfo: ProposalMetadata,
  prevState: ProposalState | null
): Promise<ProposalState | null> => {
  let _transactions = prevState?.transactions || [];
  let _maxLt = prevState?.maxLt;

  const latestMaxLtAfterTx =
    useAppPersistedStore.getState().getLatestMaxLtAfterTx(proposalAddress) ||
    "0";

  if (latestMaxLtAfterTx) {
    const { allTxns } = await TonVoteContract.getTransactions(
      clientV2,
      Address.parse(proposalAddress)
    );
    _transactions = TonVoteContract.filterTxByTimestamp(
      allTxns,
      latestMaxLtAfterTx
    );
  } else {
    const { allTxns, maxLt } = await TonVoteContract.getTransactions(
      clientV2,
      Address.parse(proposalAddress),
      prevState?.maxLt
    );
    _maxLt = maxLt;
    _transactions.unshift(...allTxns);
  }

  if (_transactions.length === 0) {
    return prevState;
  }
  const votingPower = await TonVoteContract.getVotingPower(
    clientV4,
    proposalInfo,
    _transactions,
    prevState?.votingPower
  );

  const results = TonVoteContract.getCurrentResults(
    _transactions,
    votingPower,
    proposalInfo
  );
  const rawVotes = TonVoteContract.getAllVotes(
    _transactions,
    proposalInfo
  ) as RawVotes;
  return {
    votingPower,
    results,
    votes: parseVotes(rawVotes, votingPower),
    maxLt: _maxLt,
  };
};
