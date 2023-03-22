import { Address, TonClient, TonClient4 } from "ton";
import { getStartTime, getEndTime, getSnapshotTime } from "./getters";
import { getHttpEndpoint, getHttpV4Endpoint } from "@orbs-network/ton-access";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { Logger } from "utils";
import { CUSTODIAN_ADDRESSES } from "./custodian";
import { useAppPersistedStore } from "store";
import { DEFAULT_CLIENT_V2_ENDPOINT, DEFAULT_CLIENT_V4_ENDPOINT } from "config";

export async function getClientV2() {
  const { clientV2Endpoint, apiKey, clientV2Fallback, setClientV2Fallback } =
    useAppPersistedStore.getState();

  if (clientV2Endpoint) {
    return new TonClient({ endpoint: clientV2Endpoint, apiKey });
  }
  if (clientV2Fallback) {
    return new TonClient({ endpoint: clientV2Fallback, apiKey });
  }

  let endpoint;
  try {
    endpoint = await getHttpEndpoint();
  } catch (error) {
    endpoint = DEFAULT_CLIENT_V2_ENDPOINT;
  }
  setClientV2Fallback(endpoint);

  return new TonClient({ endpoint, apiKey });
}

export async function getClientV4() {
  const { clientV4Endpoint, clientV4Fallback, setClientV4Fallback } =
    useAppPersistedStore.getState();

  if (clientV4Endpoint) {
    return new TonClient4({ endpoint: clientV4Endpoint });
  }
  if (clientV4Fallback) {
    return new TonClient4({ endpoint: clientV4Fallback });
  }

  try {
    endpoint = await getHttpV4Endpoint();
  } catch (error) {
    endpoint = DEFAULT_CLIENT_V4_ENDPOINT;
  }
  setClientV4Fallback(endpoint);

  return new TonClient4({ endpoint });
}

export async function getTransactions(contractAddress, toLt) {
  const client = await getClientV2();

  let maxLt = new BigNumber(toLt ?? -1);
  let startPage = { fromLt: "0", hash: "" };

  let allTxns = [];
  let paging = startPage;

  while (true) {
    Logger("Querying...");
    const txns = await client.getTransactions(contractAddress, {
      lt: paging.fromLt,
      to_lt: toLt,
      hash: paging.hash,
      limit: 500,
    });

    Logger(`Got ${txns.length}, lt ${paging.fromLt}`);

    if (txns.length === 0) break;

    allTxns = [...allTxns, ...txns];
    paging.fromLt = txns[txns.length - 1].lt;
    // paging.hash = txns[txns.length - 1].id.hash;
    txns.forEach((t) => {
      t.inMessage.info.src = t.inMessage.info.src.toString();
      maxLt = BigNumber.max(new BigNumber(t.lt), maxLt);
    });
  }

  return { allTxns, maxLt: maxLt.toString() };
}

export function filterTxByTimestamp(transactions, lastLt) {
  const filteredTx = _.filter(transactions, function (transaction) {
    return Number(transaction.id.lt) <= Number(lastLt);
  });

  return filteredTx;
}

export function getAllVotes(transactions, proposalInfo) {
  let allVotes = {};

  for (let i = transactions.length - 1; i >= 0; i--) {
    const txnBody = transactions[i].inMessage.body;

    let vote = txnBody.text;
    if (!vote) continue;

    if (
      transactions[i].time < proposalInfo.startTime ||
      transactions[i].time > proposalInfo.endTime ||
      CUSTODIAN_ADDRESSES.includes(transactions[i].inMessage.source)
    )
      continue;

    vote = vote.toLowerCase();
    allVotes[transactions[i].inMessage.source] = {
      timestamp: transactions[i].time,
      vote: "",
      hash: transactions[i].id.hash,
    };

    if (["y", "yes"].includes(vote)) {
      allVotes[transactions[i].inMessage.source].vote = "Yes";
    } else if (["n", "no"].includes(vote)) {
      allVotes[transactions[i].inMessage.source].vote = "No";
    } else if (["a", "abstain"].includes(vote)) {
      allVotes[transactions[i].inMessage.source].vote = "Abstain";
    }
  }

  return allVotes;
}

export async function getVotingPower(
  proposalInfo,
  transactions,
  votingPower = {}
) {
  const clientV4 = await getClientV4();

  let voters = Object.keys(getAllVotes(transactions, proposalInfo));

  let newVoters = [...new Set([...voters, ...Object.keys(votingPower)])];

  if (!newVoters) return votingPower;

  for (const voter of newVoters) {
    votingPower[voter] = (
      await clientV4.getAccountLite(
        proposalInfo.snapshot.mcSnapshotBlock,
        Address.parse(voter)
      )
    ).account.balance.coins;
  }

  return votingPower;
}

export async function getSingleVotingPower(mcSnapshotBlock, contractAddress) {
  const clientV4 = await getClientV4();

  return (
    await clientV4.getAccountLite(
      mcSnapshotBlock,
      Address.parse(contractAddress)
    )
  ).account.balance.coins;
}

export function calcProposalResult(votes, votingPower) {
  let sumVotes = {
    yes: new BigNumber(0),
    no: new BigNumber(0),
    abstain: new BigNumber(0),
  };

  for (const [voter, vote] of Object.entries(votes)) {
    if (!(voter in votingPower))
      throw new Error(`voter ${voter} not found in votingPower`);

    const _vote = vote.vote;
    if (_vote === "Yes") {
      sumVotes.yes = new BigNumber(votingPower[voter]).plus(sumVotes.yes);
    } else if (_vote === "No") {
      sumVotes.no = new BigNumber(votingPower[voter]).plus(sumVotes.no);
    } else if (_vote === "Abstain") {
      sumVotes.abstain = new BigNumber(votingPower[voter]).plus(
        sumVotes.abstain
      );
    }
  }

  const totalWeights = sumVotes.yes.plus(sumVotes.no).plus(sumVotes.abstain);
  const yesPct = sumVotes.yes
    .div(totalWeights)
    .decimalPlaces(4)
    .multipliedBy(100)
    .toNumber();
  const noPct = sumVotes.no
    .div(totalWeights)
    .decimalPlaces(4)
    .multipliedBy(100)
    .toNumber();
  const abstainPct = sumVotes.abstain
    .div(totalWeights)
    .decimalPlaces(4)
    .multipliedBy(100)
    .toNumber();

  return {
    yes: yesPct,
    no: noPct,
    abstain: abstainPct,
    totalWeight: totalWeights.toString(),
  };
}

export function getCurrentResults(transactions, votingPower, proposalInfo) {
  let votes = getAllVotes(transactions, proposalInfo);
  return calcProposalResult(votes, votingPower);
}

export async function getProposalInfo(contractAddress) {
  return {
    startTime: await getStartTime(contractAddress),
    endTime: await getEndTime(contractAddress),
    snapshot: await getSnapshotTime(contractAddress),
  };
}
