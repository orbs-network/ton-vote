import { getHttpEndpoint , getHttpV4Endpoint} from "@orbs-network/ton-access";
import { Address, fromNano, TonClient, TonClient4 } from "ton";
import {getStartTime, getEndTime, getSnapshotTime} from "./getters";

import BigNumber from "bignumber.js";
import _ from "lodash";
import { Logger } from "utils";
import { CONTRACT_ADDRESS, VOTE_OPTIONS } from "config";
import { CUSTODIAN_ADDRESSES } from "./custodian";



export async function getClientV2(customEndpoint, apiKey) {
  const localStorageV2 = localStorage.getItem("v2");
  if (localStorageV2) {
     return new TonClient({ endpoint: localStorageV2 });
  }
    // if (customEndpoint) {
    //   return new TonClient({ endpoint: customEndpoint, apiKey });
    // }
  const endpoint = await getHttpEndpoint();
   localStorage.setItem("v2", endpoint);
  return new TonClient({ endpoint });
}

export async function getClientV4(customEndpoint) {
    const localStorageV4 = localStorage.getItem("v4");
  if(localStorageV4) {
     return new TonClient4({ endpoint: localStorageV4 });
  }
  // const endpoint = customEndpoint || "https://mainnet-v4.tonhubapi.com";
  const endpoint = await getHttpV4Endpoint();
   localStorage.setItem("v4", endpoint);
  return new TonClient4({ endpoint });
}

export async function getTransactions(client, toLt) {
  let maxLt = new BigNumber(toLt ?? -1);
  let startPage = { fromLt: "0", hash: "" };

  let allTxns = [];
  let paging = startPage;

  while (true) {
    Logger("Querying...");
    const txns = await client.getTransactions(CONTRACT_ADDRESS, {
      lt: paging.fromLt,
      to_lt: toLt,
      hash: paging.hash,
      limit: 500,
    });

    Logger(`Got ${txns.length}, lt ${paging.fromLt}`);

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

export function filterTxByTimestamp(transactions, lastLt) {
  const filteredTx = _.filter(transactions, function (transaction) {
    return Number(transaction.id.lt) <= Number(lastLt);
  });

  return filteredTx;
}

function verifyVote(vote) {
  if (!vote) return false;
  if (!Array.isArray(vote)) return false;
  if (!vote.length != VOTE_OPTIONS.length) return false;

  const voteObj = vote.reduce((accumulator, currentValue) => {
    if (currentValue in VOTE_OPTIONS) {
      accumulator[currentValue] =
        currentValue in accumulator ? accumulator[currentValue] + 1 : 1;
    }
    return accumulator;
  }, {});

  return Object.keys(accumulator).length == VOTE_OPTIONS.length;
}

export function getAllVotes(transactions, proposalInfo) {
  let allVotes = {};

  for (let i = transactions.length - 1; i >= 0; i--) {
    const txnBody = transactions[i].inMessage.body;

    console.log(txnBody.text);

    // vote should be a string of numbers with or without comma
    // e.g: '1, 2, 3' or '1 2 3'
    const vote = txnBody.text.split("/,|s/").map((numberString) => {
      return parseInt(numberString.trim());
    });

    // verify user sent exatcly 3 options all of them are valid and every option appears only once
    if (!verifyVote(vote)) continue;

    if (
      transactions[i].time < proposalInfo.startTime ||
      transactions[i].time > proposalInfo.endTime ||
      CUSTODIAN_ADDRESSES.includes(transactions[i].inMessage.source)
    )
      continue;

    allVotes[transactions[i].inMessage.source] = {
      timestamp: transactions[i].time,
      vote: vote,
      hash: transactions[i].id.hash,
    };
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

export async function getSingleVotingPower(clientV4, mcSnapshotBlock, address) {
  return (
    await clientV4.getAccountLite(mcSnapshotBlock, Address.parse(address))
  ).account.balance.coins;
}

export function calcProposalResult(votes, votingPower) {
  // sumVotes = {"0": 0, "1": 0, "2": 0, "3": 0, ...}
  const sumVotes = VOTE_OPTIONS.reduce((accumulator, currentValue) => {
    accumulator[currentValue] = new BigNumber(0);
    return accumulator;
  }, {});

  for (const [voter, vote] of Object.entries(votes)) {
    if (!(voter in votingPower))
      throw new Error(`voter ${voter} not found in votingPower`);

    const voterPower = new BigNumber(votingPower[voter]);
    const voterPowerPart = voterPower.div(vote.vote.length);
    // vote.vote is an arary with exactly 3 options e.g.: ['7', '2', '5']
    for (const _vote of vote.vote) {
      sumVotes[_vote] = voterPowerPart.plus(sumVotes[_vote]);
    }
  }

  let proposalResult = {};
  const totalPower = new BigNumber(0);

  for (const optionTotalPower of Object.values(sumVotes)) {
    totalPower = totalPower.plus(optionTotalPower);
  }

  for (const [voteOption, optionTotalPow] of Object.items(sumVotes)) {
    proposalResult[voteOption] = optionTotalPow
      .div(totalPower)
      .decimalPlaces(4)
      .multipliedBy(100)
      .toNumber();
  }

  return { proposalResult, totalPower };
}

export function getCurrentResults(transactions, votingPower, proposalInfo) {
  let votes = getAllVotes(transactions, proposalInfo);
  return calcProposalResult(votes, votingPower);
}

export async function getProposalInfo(client, clientV4) {
  return {
    startTime: await getStartTime(client, CONTRACT_ADDRESS),
    endTime: await getEndTime(client, CONTRACT_ADDRESS),
    snapshot: await getSnapshotTime(client, clientV4, CONTRACT_ADDRESS),
  };
}
