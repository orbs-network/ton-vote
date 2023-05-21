import axios from "axios";
import { GOOGLE_ANALYTICS_KEY } from "config";
import ReactGA from "react-ga4";
import { MetadataArgs, ProposalMetadata } from "ton-vote-contracts-sdk";
import { ProposalResults } from "types";

 ReactGA.initialize(GOOGLE_ANALYTICS_KEY);

const sendEvent = (label: string, action: string) => {
  if (!ReactGA.isInitialized) {
    console.error("GA is Not initialized");
    return;
  }
  ReactGA.event({
    label,
    action,
    category: "Main page",
  });
};
const verifySuccess = (proposalId: string) => {
  sendEvent("Verify success", "verify success");
  sendLog({ action: "verify success", proposalId });
};

const verifyFailed = (
  proposalId: string,
  currentValue: ProposalResults,
  compareValue: ProposalResults
) => {
  sendEvent("Verify failed", "verify failed");
  sendLog({ action: "verify failed", proposalId, currentValue, compareValue });
};

const walletSelect = (wallet: string) => {
  sendEvent("Wallet select", `wallet: ${wallet}`);
  sendLog({ action: "wallet select", wallet });
};

const voteSuccess = (proposalAddress: string, vote: string) => {
  sendEvent("Vote success", `vote: ${vote}, proposal: ${proposalAddress}`);
  sendLog({ action: "vote success", vote, proposalAddress });
};

const voteError = (proposalAddress: string, vote: string, error: string) => {
  sendEvent("Vote failed", `error: ${error}`);
  sendLog({ action: "vote failed", vote, error, proposalAddress });
};

const createSpaceMetadataSucess = (address: string, metadata: MetadataArgs) => {
  sendEvent("Create space metadata success", `address: ${address}`);
  sendLog({ action: "create space metadata success", address, metadata });
};

const createSpaceMetadataFailed = (error: string, metadata: MetadataArgs) => {
  sendEvent("Create space metadata failed", `error: ${error}`);
  sendLog({ action: "create space metadata failed", error, metadata });
};

const createSpaceSuccess = (metadataAddress: string, daoAddress: string) => {
  sendEvent("Create space success", `address: ${daoAddress}`);
  sendLog({ action: "create space success", metadataAddress, daoAddress });
};

const createSpaceFailed = (
  metadataAddress: string,
  error: string
) => {
  sendEvent("Create space failed", `error: ${error}`);
  sendLog({ action: "create space failed", error, metadataAddress });
};

const createProposalSuccess = (
  proposalMetadata: ProposalMetadata,
  address: string
) => {
  sendEvent("CreateProposalSuccess", `address: ${address}`);
  sendLog({ action: "create proposal success", proposalMetadata, address });
};

const createProposalFailed = (
  proposalMetadata: ProposalMetadata,
  error: string
) => {
  sendEvent("Create proposal failed failed", `error: ${error}`);
  sendLog({ action: "create proposal failed", proposalMetadata, error });
};

const updateDaoMetadataSuccess = (metadata: MetadataArgs, address: string) => {
  sendEvent("Update dao metadata success", `address: ${address}`);
  sendLog({ action: "update dao metadata success", metadata, address });
};

const updateDaoMetatdaFailed = (metadata: MetadataArgs, address: string, error: string) => {
  sendEvent("Update space failed", `error: ${error}, address: ${address}`);
  sendLog({ action: "update space failed", error, metadata, address });
};

function sendLog<T extends { action: string }>(body: T) {
  try {
    axios.post("https://bi.orbs.network/putes/ton-vote", body);
  } catch (error) {}
}

const analytics = {
  verifySuccess,
  verifyFailed,
  walletSelect,
  voteSuccess,
  voteError,
  createSpaceSuccess,
  createSpaceFailed,
  createProposalSuccess,
  createProposalFailed,
  updateDaoMetadataSuccess,
  updateDaoMetatdaFailed,
  createSpaceMetadataSucess,
  createSpaceMetadataFailed,
};

export { analytics };
