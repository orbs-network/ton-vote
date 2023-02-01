import { waitForContractToBeDeployed, sleep, initWallet, initDeployKey } from "./src/helpers";
import { CommonMessageInfo, TonClient, toNano, StateInit, InternalMessage} from "ton";
import {Proposal} from "./contracts-ts/proposal";
import * as process from "process";
require('dotenv').config();

export const client = new TonClient({ endpoint: process.env.TON_ENDPOINT || "https://toncenter.com/api/v2/jsonRPC", apiKey: process.env.TON_API_KEY});

const NOMINATOR_MIN_TON = 0.1;


async function deploy() {

	const contract = await Proposal.create(Number(process.env.START_EPOCH), Number(process.env.END_EPOCH), Number(process.env.SNAPSHOT_BLOCK), process.env.INACTIVE_ADDRESSES?.split(',') || []);

	let deployWalletKey = await initDeployKey("");
	let deployWallet = await initWallet(client, deployWalletKey.publicKey);

	if (await client.isContractDeployed(contract.address)) {
		console.log(`contract: ${contract.address.toFriendly()} already Deployed`);
		return contract;
	}
	const balance = await client.getBalance(deployWallet.address);
	if ( balance.lte(toNano(NOMINATOR_MIN_TON)) ) {
		throw `insufficient funds to deploy single nominator contract wallet have only ${balance}`;
	}

	const seqno = await deployWallet.getSeqNo();
	const transfer = await deployWallet.createTransfer({
		secretKey: deployWalletKey.secretKey,
		seqno: seqno,
		sendMode: 1 + 2,
		order: new InternalMessage({
			to: contract.address,
			value: toNano(NOMINATOR_MIN_TON),
			bounce: false,
			body: new CommonMessageInfo({
				stateInit: new StateInit({data: contract.source.initialData, code: contract.source.initialCode}),
				body: null,
			}),
		}),
	});

	await client.sendExternalMessage(deployWallet, transfer);
	let isDeployed = await waitForContractToBeDeployed(client, contract.address);
	if(!isDeployed) {
		throw `single nominator failed to deploy`
	}
	console.log(`- Deploy transaction sent successfully to -> ${contract.address.toFriendly()} [seqno:${seqno}]`);
	await sleep(10000);
	return contract;
}

deploy().then(
    () => {
        console.log('Done');
        process.exit(0);
    }).catch(
   (e) => {
        console.error(e);
        process.exit(1);
    });
