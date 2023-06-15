import { useQuery } from "@tanstack/react-query";
import { useTonAddress, useTonWallet } from "@tonconnect/ui-react";
import { api } from "api";
import axios from "axios";
import { GOOGLE_ANALYTICS_KEY, IS_DEV } from "config";
import { useCallback, useMemo } from "react";
import { isMobile } from "react-device-detect";
import ReactGA from "react-ga4";
import { MetadataArgs, ProposalMetadata } from "ton-vote-contracts-sdk";
import { ProposalResults } from "types";
//@ts-ignore
import packageJson from "../package.json";

const sendEvent = (label: string, action: string) => {
  if (IS_DEV) return;

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

if (!IS_DEV) {
  ReactGA.initialize(GOOGLE_ANALYTICS_KEY);
}

const useAnalytics = () => {
  const sendLog = useSendLog();

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
    sendLog({
      action: "verify failed",
      proposalId,
      currentValue,
      compareValue,
    });
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

  const createSpaceMetadataSucess = (
    address: string,
    metadata: MetadataArgs
  ) => {
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

  const createSpaceFailed = (metadataAddress: string, error: string) => {
    sendEvent("Create space failed", `error: ${error}`);
    sendLog({ action: "create space failed", error, metadataAddress });
  };

  const createProposalSuccess = (
    proposalMetadata: ProposalMetadata,
    proposalAddress: string
  ) => {
    sendEvent("CreateProposalSuccess", `address: ${proposalAddress}`);
    sendLog({
      action: "create proposal success",
      proposalMetadata,
      proposalAddress,
    });
  };

  const createProposalFailed = (
    proposalMetadata: ProposalMetadata,
    error: string
  ) => {
    sendEvent("Create proposal failed failed", `error: ${error}`);
    sendLog({ action: "create proposal failed", proposalMetadata, error });
  };

  const updateDaoMetadataSuccess = (
    metadata: MetadataArgs,
    daoAddress: string
  ) => {
    sendEvent("Update dao metadata success", `dao address: ${daoAddress}`);
    sendLog({ action: "update dao metadata success", metadata, daoAddress });
  };

  const updateDaoMetatdaFailed = (
    metadata: MetadataArgs,
    daoAddress: string,
    error: string
  ) => {
    sendEvent("Update space failed", `error: ${error}, dao address: ${daoAddress}`);
    sendLog({ action: "update space failed", error, metadata, daoAddress });
  };

  const getProposalFromServerFailed = (proposalId: string, error: string) => {
    sendLog({ action: "get proposal from server failed", proposalId, error });
  };
  const getProposalFromContractFailed = (proposalId: string, error: string) => {
    sendLog({ action: "get proposal from contract failed", proposalId, error });
  };

   const getProposalFromContractAfterVotingFailed = (
     proposalId: string,
     error: string
   ) => {
     sendLog({
       action: 'get proposal from contract after voting failed',
       proposalId,
       error,
     });
   };


  const getDaoFromServerFailed = (daoId: string, error: any) => {
    sendLog({
      action: "get dao from server failed",
      daoId,
      error: handleError(error),
    });
  };

  const getDaoFromContractFailed = (daoId: string, error: any) => {
    sendLog({
      action: "get dao from contract failed",
      daoId,
      error: handleError(error),
    });
  };

  return {
    verifySuccess,
    verifyFailed,
    walletSelect,
    voteSuccess,
    voteError,
    createSpaceMetadataSucess,
    createSpaceMetadataFailed,
    createSpaceSuccess,
    createSpaceFailed,
    createProposalSuccess,
    createProposalFailed,
    updateDaoMetadataSuccess,
    updateDaoMetatdaFailed,
    getProposalFromServerFailed,
    getProposalFromContractFailed,
    getDaoFromServerFailed,
    getDaoFromContractFailed,
    getProposalFromContractAfterVotingFailed,
  };
};

const handleError = (error: any) => {
  return error instanceof Error ? error.message : error;
}

const useServerVersionQuery = () => {
  return useQuery(["serverVersion"], api.serverVersion)
}

const useSendLog = () => {
  const walletAddress = useTonAddress();
  const wallet = useTonWallet();

  const {data: serverVersion} = useServerVersionQuery();
    
  const walletName = wallet?.device.appName;
  const walletVersion = wallet?.device.appVersion;
  const platform = wallet?.device.platform;
  const device = isMobile ? "mobile" : "desktop";

  const values = useMemo(
    () => ({
      walletAddress,
      walletName,
      walletVersion,
      platform,
      device,
      serverVersion,
      sdkVerion: packageJson.dependencies["ton-vote-contracts-sdk"],
      uiVersion: packageJson.version,
    }),
    [walletAddress, walletName, walletVersion, platform, device]
  );

  return useCallback(
    <T extends { action: string }>(body: T) => {
      const name = IS_DEV ? "ton-vote-dev" : "ton-vote";
      try {
        axios.post(`https://bi.orbs.network/putes/${name}`, {
          ...values,
          ...body,
        });
      } catch (error) {}
    },
    [values]
  );
};

export { useAnalytics };
