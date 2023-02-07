import {
  Address,
  WalletContract,
} from "ton";
import { mnemonicNew, mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletV3R2Source, fromNano, beginDict, Cell, beginCell } from "ton";
import fs from "fs";
import {execSync} from "child_process";
import {SNAKE_PREFIX, ONCHAIN_CONTENT_PREFIX, KEY_LEN, KEY_VAL} from "./config";
  


export async function waitForContractToBeDeployed(client: TonClient, deployedContract: Address) {
  const seqnoStepInterval = 2500;
  let retval = false;
  console.log(`⏳ waiting for contract to be deployed at [${deployedContract.toFriendly()}]`);
  for (var attempt = 0; attempt < 10; attempt++) {
    await sleep(seqnoStepInterval);
    if (await client.isContractDeployed(deployedContract)) {
      retval = true;
      break;
    }
  }
  console.log(`⌛️ waited for contract deployment ${((attempt + 1) * seqnoStepInterval) / 1000}s`);
  return retval;
}

export async function waitForSeqno(walletContract: WalletContract, seqno: number) {
  const seqnoStepInterval = 3000;
  console.log(`⏳ waiting for seqno to update (${seqno})`);
  for (var attempt = 0; attempt < 10; attempt++) {
    await sleep(seqnoStepInterval);
    const seqnoAfter = await walletContract.getSeqNo();
    if (seqnoAfter > seqno) break;
  }
  console.log(`⌛️ seqno update after ${((attempt + 1) * seqnoStepInterval) / 1000}s`);
}

export function sleep(time: number) {
  return new Promise((resolve) => {
    console.log(`💤 ${time / 1000}s ...`);

    setTimeout(resolve, time);
  });
}

export async function initWallet(client: TonClient, publicKey: Buffer, workchain = 0) {
  const wallet = await WalletContract.create(client, WalletV3R2Source.create({ publicKey: publicKey, workchain }));
  const walletBalance = await client.getBalance(wallet.address);
  if (parseFloat(fromNano(walletBalance)) < 0.5) {
    throw `Insufficient Deployer [${wallet.address.toFriendly()}] funds ${fromNano(walletBalance)}`;
  }
  console.log(
    `Init wallet ${wallet.address.toFriendly()} | balance: ${fromNano(await client.getBalance(wallet.address))} | seqno: ${await wallet.getSeqNo()}
`
  );

  return wallet;
}

export async function initDeployKey(index = '') {
	const deployConfigJson = `./build/deploy.config.json`;
	const deployerWalletType = "org.ton.wallets.v3.r2";
	let deployerMnemonic;
	if (!fs.existsSync(deployConfigJson)) {
		console.log(`\n* Config file '${deployConfigJson}' not found, creating a new wallet for deploy..`);
		deployerMnemonic = (await mnemonicNew(24)).join(" ");
		const deployWalletJsonContent = {
		  created: new Date().toISOString(),
		  deployerWalletType,
		  deployerMnemonic,
	};
	fs.writeFileSync(deployConfigJson, JSON.stringify(deployWalletJsonContent, null, 2));
		console.log(` - Created new wallet in '${deployConfigJson}' - keep this file secret!`);
	} else {
		console.log(`\n* Config file '${deployConfigJson}' found and will be used for deployment!`);
		const deployConfigJsonContentRaw = fs.readFileSync(deployConfigJson, "utf-8");
		const deployConfigJsonContent = JSON.parse(deployConfigJsonContentRaw);
		if (!deployConfigJsonContent.deployerMnemonic) {
		  console.log(` - ERROR: '${deployConfigJson}' does not have the key 'deployerMnemonic'`);
		  process.exit(1);
		}
		deployerMnemonic = deployConfigJsonContent.deployerMnemonic;
	}
	return mnemonicToWalletKey(deployerMnemonic.split(" "), index);
}

export function compileFuncToB64(funcFiles: string[]): string {
    const funcPath = process.env.FUNC_PATH || "/usr/local/bin/func";
    try {
        execSync(`${funcPath} -o build/tmp.fif  -SPA ${funcFiles.join(" ")}`);
    } catch (e: any) {
        if (e.message.indexOf("error: `#include` is not a type identifier") > -1) {
            console.log(`
============================================================================================================
Please update your func compiler to support the latest func features
to set custom path to your func compiler please set  the env variable "export FUNC_PATH=/usr/local/bin/func"
============================================================================================================
`);
            process.exit(1);
        } else {
            console.log(e.message);
        }
    }

    const stdOut = execSync(`/usr/local/bin/fift -s build/_print-hex.fif`).toString();
    return stdOut.trim();
}

export function createDictFromStr(str: string): Cell {

  const dict = beginDict(KEY_LEN);

  let bufferToStore = Buffer.from(str);

  const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

  const rootCell = new Cell();
  rootCell.bits.writeUint8(SNAKE_PREFIX);
  let currentCell = rootCell;

  while (bufferToStore.length > 0) {
    currentCell.bits.writeBuffer(bufferToStore.slice(0, CELL_MAX_SIZE_BYTES));
    
    bufferToStore = bufferToStore.slice(CELL_MAX_SIZE_BYTES);
    if (bufferToStore.length > 0) {
      const newCell = new Cell();
      currentCell.refs.push(newCell);
      currentCell = newCell;
    }
  }

  dict.storeRef(KEY_VAL, rootCell); 
  
  return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict.endDict()).endCell()

}
