import { getClientV2, getClientV4 } from "./logic";

export async function getSnapshotTime(contractAddress) {
  const client = await getClientV2();
  const res = await client.callGetMethod(
    contractAddress,
    "proposal_snapshot_time"
  );
  const snapshotTime = Number(res.stack[0][1]);

  const mcSnapshotBlock = await getBlockFromTime(snapshotTime);

  return { snapshotTime, mcSnapshotBlock };
}

export async function getStartTime(contractAddress) {
  const client = await getClientV2();
  const res = await client.callGetMethod(
    contractAddress,
    "proposal_start_time"
  );
  return Number(res.stack[0][1]);
}

export async function getEndTime(contractAddress) {
  const client = await getClientV2();

  const res = await client.callGetMethod(contractAddress, "proposal_end_time");
  return Number(res.stack[0][1]);
}

async function getBlockFromTime(utime) {
  let mcSnapshotBlock = null;
  const clientV4 = await getClientV4();

  let res = (await clientV4.getBlockByUtime(utime)).shards;

  for (let i = 0; i < res.length; i++) {
    if (res[i].workchain == -1) return res[i].seqno;
  }

  throw Error(`could not find materchain seqno at time ${utime}`);
}
