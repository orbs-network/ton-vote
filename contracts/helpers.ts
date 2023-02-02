import {
  Address,
  WalletContract,
} from "ton";
import { mnemonicNew, mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletV3R2Source, fromNano } from "ton";
import fs from "fs";
import {execSync} from "child_process";


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

