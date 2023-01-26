import { getHttpEndpoint, getHttpV4Endpoint } from "@orbs-network/ton-access";
import { Address, beginCell, Cell, TonClient, TonClient4 } from "ton";
import BigNumber from "bignumber.js";
import _ from "lodash";


export const votingContract = Address.parse(
  "Ef_bG7kFwT4lLusRCfMN_n2mY4X4Gsa-IT9tpcNKproRukpH"
);

export async function getClientV2() {
  const endpoint = await getHttpEndpoint();
  return new TonClient({ endpoint });
}

export async function getClientV4() {
  const endpoint = await getHttpV4Endpoint();
  return new TonClient4({ endpoint });
}

export async function getTransactions(
  client,
  startPage = { fromLt: "0", hash: "" }
) {
  let toLt = null;
  let maxLt = new BigNumber(toLt ?? -1);

  let allTxns = [];
  let paging = startPage;

  while (true) {
    console.log("Querying...");
    const txns = await client.getTransactions(votingContract, {
      lt: paging.fromLt,
      to_lt: toLt ?? undefined,
      hash: paging.hash,
      limit: 100
    });

    console.log(`Got ${txns.length}, lt ${paging.fromLt}`);

    allTxns = [...allTxns, ...txns];

    if (txns.length === 0) break;

    paging.fromLt = txns[txns.length - 1].id.lt;
    paging.hash = txns[txns.length - 1].id.hash;
    txns.forEach((t) => {
      t.inMessage.source = t.inMessage.source.toFriendly();
      maxLt = BigNumber.max(new BigNumber(t.id.lt), maxLt);
    });
  }

  return { allTxns, paging };
}

export function getAllVotes(transactions, proposalInfo) {
  let allVotes = {};

  for (let i = transactions.length - 1; i >= 0; i--) {
    const txnBody = transactions[i].inMessage.body

    let vote = txnBody.text;

    if (!vote) {
      vote = txnBody.data?.data;
      if (vote) {
        const c = Cell.fromBoc(Buffer.from(vote))[0].beginParse()
        if (c.remaining < 8) {
          continue;
        }
        console.log(2, c.toCell().toString())
        const voteNum = c.readUint(8).toNumber();
        vote = String.fromCharCode(voteNum);
      } else { continue; }
    }

    if (!vote) continue;

    if (
      transactions[i].time < proposalInfo.startDate ||
      transactions[i].time > proposalInfo.endDate
    )
      continue;

    vote = vote.toLowerCase();

    if (["y", "yes"].includes(vote)) {
      allVotes[transactions[i].inMessage.source] = "Yes";
    } else if (["n", "no"].includes(vote)) {
      allVotes[transactions[i].inMessage.source] = "No";
    } else if (["a", "abstain"].includes(vote)) {
      allVotes[transactions[i].inMessage.source] = "Abstain";
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
      await clientV4.getAccountLite(proposalInfo.snapshot, Address.parse(voter))
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

    if (vote === "Yes") {
      sumVotes.yes = new BigNumber(votingPower[voter]).plus(sumVotes.yes);
    } else if (vote === "No") {
      sumVotes.no = new BigNumber(votingPower[voter]).plus(sumVotes.no);
    } else if (vote === "Abstain") {
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

export async function getSnapshotBlock(client) {
  const res = await client.callGetMethod(
    votingContract,
    "proposal_snapshot_block"
  );
  return Number(res.stack[0][1]);
}

export async function getStartDate(client) {
  const res = await client.callGetMethod(votingContract, "proposal_start_time");
  return Number(res.stack[0][1]);
}

export async function getEndDate(client) {
  const res = await client.callGetMethod(votingContract, "proposal_end_time");
  return Number(res.stack[0][1]);
}

export function getCurrentResults(transactions, votingPower, proposalInfo) {
  // console.log(transactions, votingPower, proposalInfo);
  let votes = getAllVotes(transactions, proposalInfo);
  return calcProposalResult(votes, votingPower);
}

export async function getProposalInfo(client) {
  return {
    startDate: await getStartDate(client),
    endDate: await getEndDate(client),
    snapshot: await getSnapshotBlock(client),
  };
}
