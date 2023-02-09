import { CONTRACT_ADDRESS } from "config";
import { Address } from "ton";

export async function getSnapshotTime(client, clientV4) {
  const res = await client.callGetMethod(
    CONTRACT_ADDRESS,
    "proposal_snapshot_time"
  );
  const snapshotTime = Number(res.stack[0][1]);

  const mcSnapshotBlock = await getBlockFromTime(clientV4, snapshotTime);

  return { snapshotTime, mcSnapshotBlock };
}

export async function getStartTime(client) {
  const res = await client.callGetMethod(
    CONTRACT_ADDRESS,
    "proposal_start_time"
  );
  return Number(res.stack[0][1]);
}

export async function getEndTime(client) {
  const res = await client.callGetMethod(
    CONTRACT_ADDRESS,
    "proposal_end_time"
  );
  return Number(res.stack[0][1]);
}

async function getBlockFromTime(clientV4, utime) {
  let mcSnapshotBlock = null;

  let res = (await clientV4.getBlockByUtime(utime)).shards;

  for (let i = 0; i < res.length; i++) {
    if (res[i].workchain == -1) return res[i].seqno;
  }

  throw Error(`could not find materchain seqno at time ${utime}`);
}
