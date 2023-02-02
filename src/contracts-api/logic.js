import { getHttpEndpoint, getHttpV4Endpoint } from "@orbs-network/ton-access";
import { Address, beginCell, Cell, TonClient, TonClient4 } from "ton";
import {getFrozenAddresses, getStartTime, getEndTime, getSnapshotTime} from "./getters";
import { votingContract } from "./address";

import BigNumber from "bignumber.js";
import _ from "lodash";



export async function getClientV2(customEndpoint, apiKey) {
  if (customEndpoint) {
    return new TonClient({ endpoint: customEndpoint, apiKey });
  }
  const endpoint = await getHttpEndpoint();
  return new TonClient({ endpoint });
}

export async function getClientV4(customEndpoint) {
  const endpoint = customEndpoint || "https://mainnet-v4.tonhubapi.com";
  return new TonClient4({ endpoint });
}

export async function getTransactions(
  client,
  toLt = null
) {
  let maxLt = new BigNumber(toLt ?? -1);
  let startPage = { fromLt: "0", hash: "" };

  let allTxns = [];
  let paging = startPage;

  while (true) {
    console.log("Querying...");
    const txns = await client.getTransactions(votingContract, {
      lt: paging.fromLt,
      to_lt: toLt ?? undefined,
      hash: paging.hash,
      limit: 100,
    });

    console.log(`Got ${txns.length}, lt ${paging.fromLt}`);

    if (txns.length === 0) break;

    allTxns = [...allTxns, ...txns];

    paging.fromLt = txns[txns.length - 1].id.lt;
    paging.hash = txns[txns.length - 1].id.hash;
    txns.forEach((t) => {
      t.inMessage.source = t.inMessage.source.toFriendly();
      maxLt = BigNumber.max(new BigNumber(t.id.lt), maxLt);
    });
  }

  return { allTxns, maxLt: maxLt.toString() };
}

export function getAllVotes(transactions, proposalInfo) {
  let allVotes = {};

  for (let i = transactions.length - 1; i >= 0; i--) {
    const txnBody = transactions[i].inMessage.body;

    let vote = txnBody.text;
    if (!vote) continue;

    if (
      transactions[i].time < proposalInfo.startDate ||
      transactions[i].time > proposalInfo.endDate
    )
      continue;

    vote = vote.toLowerCase();

    allVotes[transactions[i].inMessage.source] = {
      timestamp: transactions[i].time,
      vote: "",
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
  clientV4,
  proposalInfo,
  transactions,
  votingPower = {}
) {
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

export function calcProposalResult(votes, votingPower) {
  let sumVotes = {
    yes: new BigNumber(0),
    no: new BigNumber(0),
    abstain: new BigNumber(0),
  };

  for (const [voter, vote] of Object.entries(votes)) {
    if (!(voter in votingPower))
      throw new Error(`voter ${voter} not found in votingPower`);

      const _vote = vote.vote 

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
    .decimalPlaces(2)
    .multipliedBy(100)
    .toNumber();
  const noPct = sumVotes.no
    .div(totalWeights)
    .decimalPlaces(2)
    .multipliedBy(100)
    .toNumber();
  const abstainPct = sumVotes.abstain
    .div(totalWeights)
    .decimalPlaces(2)
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

export async function getProposalInfo(client, clientV4) {
  //1674683234
  return {
    startDate: await getStartTime(client),
    endDate: await getEndTime(client),
    snapshot: await getSnapshotTime(client, clientV4),
  };
}
