import { api } from "api";
import { contract } from "contract";
import * as SDK from "ton-vote-contracts-sdk";
import { getVoteStrategyType, isNftProposal, Logger } from "utils";
import retry from "async-retry";
import { TonClient } from "ton";
import _ from "lodash";

const getAllNFTHolders = async (
  proposalAddress: string,
  metadata: SDK.ProposalMetadata,
  signal?: AbortSignal
) => {
  if (!isNftProposal(metadata.votingPowerStrategies)) {
    return {} as { [key: string]: string[] };
  }
  let nftItemsHolders;

  nftItemsHolders = await api.getAllNftHolders(proposalAddress, signal);

  if (nftItemsHolders) {
    return nftItemsHolders;
  }

  return contract.getAllNftHolders(metadata);
};

const readJettonMetadata = (address: string) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Jetton metadata readed from contract, attempt: ${attempt}, address: ${address}`
    );
    const clientV2 = await SDK.getClientV2();
    const result = await SDK.readJettonWalletMetadata(clientV2, address);
      console.log(result);
      
    if (_.isEmpty(result)) {
      throw new Error("Empty result");
    }
    return result;
  };
  return retry(promise, { retries: 5 });
};

const readNFTItemMetadata = (address: string) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `NFT item metadata readed from contract, attempt: ${attempt}, address: ${address}`
    );
    const clientV2 = await SDK.getClientV2();
    const result = await SDK.readNftItemMetadata(clientV2, address);

    if (_.isEmpty(result)) {
      throw new Error("Empty result");
    }
    return result;
  };
  return retry(promise, { retries: 3 });
};

const readNFTCollectionMetadata = (address: string) => {
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `NFT collection metadata readed from contract, attempt: ${attempt}, address: ${address}`
    );
    const clientV2 = await SDK.getClientV2();
    const result = await SDK.readNftCollectionMetadata(clientV2, address);

    if (_.isEmpty(result)) {
      throw new Error("Empty result");
    }
    return result;
  };
  return retry(promise, { retries: 3 });
};

const getWalletNFTCollectionItems = (
  collectionAddr: string,
  connectedWallet?: string
) => {
  if (!connectedWallet) {
    console.error("connectedWallet is undefined");
    return [];
  }
  const promise = async (bail: any, attempt: number) => {
    Logger(
      `Get wallet nft items from collection, attempt: ${attempt}, address: ${collectionAddr}`
    );
    const clientV4 = await SDK.getClientV4();
    const result = await SDK.getAllNftHoldersFromCollectionAddr(
      clientV4,
      collectionAddr
    );      
    return result[connectedWallet as any] || [];
  };
  return retry(promise, { retries: 3 });
};

const getClients = async () => {
  return {
    clientV2: await SDK.getClientV2(),
    clientV4: await SDK.getClientV4(),
  };
};

export const lib = {
  getAllNFTHolders,
  getClients,
  readJettonMetadata,
  readNFTItemMetadata,
  getWalletNFTCollectionItems,
  readNFTCollectionMetadata,
};
