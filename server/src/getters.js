import {SNAKE_PREFIX, ONCHAIN_CONTENT_PREFIX, KEY_LEN, KEY_VAL} from "./contracts/config";
import { Address, Cell } from "ton";
import { votingContract } from "./address";


export async function getFrozenAddresses(client, clientV4) {
  
    let res = await client.callGetMethod(votingContract, "frozen_addresses");
    const frozen_addresses = res.stack[0][1].bytes;
  
    let cell = Cell.fromBoc(Buffer.from(frozen_addresses, 'base64').toString('hex'))[0]
  
    const contentSlice = cell.beginParse();
    if (contentSlice.readUint(8).toNumber() !== ONCHAIN_CONTENT_PREFIX)
      throw new Error("Expected onchain content marker");
  
  
    const dict = contentSlice.readDict(KEY_LEN, (s) => {
      const buffer = Buffer.from("");
  
      const sliceToVal = (s, v, isFirst) => {
        s.toCell().beginParse();
        if (isFirst && s.readUint(8).toNumber() !== SNAKE_PREFIX)
          throw new Error("Only snake format is supported");
  
        v = Buffer.concat([v, s.readRemainingBytes()]);
        if (s.remainingRefs === 1) {
          v = sliceToVal(s.readRef(), v, false);
        }
  
        return v;
      };
  
      return sliceToVal(s.readRef(), buffer, true);
    });
    
    return (dict.get(`${KEY_VAL}`).toString()).split(', ');
  }

export async function getSnapshotTime(client, clientV4) {
  const res = await client.callGetMethod(
    votingContract,
    "proposal_snapshot_time"
  );
  const snapshotTime = Number(res.stack[0][1]);

  const mcSnapshotBlock = await getBlockFromTime(clientV4, snapshotTime);

  return {snapshotTime, mcSnapshotBlock};
}

export async function getStartTime(client) {
  const res = await client.callGetMethod(votingContract, "proposal_start_time");
  return Number(res.stack[0][1]);
}

export async function getEndTime(client) {
  const res = await client.callGetMethod(votingContract, "proposal_end_time");
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