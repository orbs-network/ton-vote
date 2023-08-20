import { useTonAddress, useTonWallet } from "@tonconnect/ui-react";
import { api } from "api";
import axios from "axios";
import { GOOGLE_ANALYTICS_KEY, IS_DEV } from "config";
import _ from "lodash";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";
import ReactGA from "react-ga4";
import { MetadataArgs, ProposalMetadata } from "ton-vote-contracts-sdk";
//@ts-ignore
import packageJson from "../package.json";

if (!IS_DEV) {
  ReactGA.initialize(GOOGLE_ANALYTICS_KEY);
}

export const useWalletListener = () => {
  const wallet = useTonWallet();
  const walletAddress = useTonAddress();

  useEffect(() => {
    analytics.onWalletChanged(walletAddress, wallet);
  }, [walletAddress]);
};

class Analytics {
  body = {
    _id: crypto.randomUUID(),
    sdkVerion: packageJson.dependencies["ton-vote-contracts-sdk"],
    uiVersion: packageJson.version,
  } as AnalyticsBody;
  history: State[] = [];
  timestamp = new Date().getTime();
  endpoint = IS_DEV ? "ton-vote-dev" : "ton-vote";

  onWalletChanged = (
    walletAddress: string,
    wallet: ReturnType<typeof useTonWallet>
  ) => {
    if (walletAddress === this.body.walletAddress) return;
    this.sendLog("walletChanged", {
      walletAddress,
      walletName: wallet?.device.appName,
      walletVersion: wallet?.device.appVersion,
      platform: wallet?.device.platform,
      device: isMobile ? "mobile" : "desktop",
    });
  };

  verifyResultsRequest = (verifyResultsProposalAddress: string) => {
    this.sendLog("verifyResultsRequest", { verifyResultsProposalAddress });
  };

  verifyResultsSuccess = () => {
    this.sendLog("verifyResultsSuccess");
  };

  verifyResultsError = (verifyResultsError: string) => {
    this.sendLog("verifyResultsError", { verifyResultsError });
  };

  createSpaceMetadataRequest = (createSpaceMetadata: MetadataArgs) => {
    this.sendLog("createSpaceMetadataRequest", { createSpaceMetadata });
  };

  createSpaceMetadataFailed = (createSpaceMetadataError: string) => {
    this.sendLog("createSpaceMetadataFailed", { createSpaceMetadataError });
  };

  createSpaceMetadataSuccess = (createSpaceMetadataAddress: string) => {
    this.sendLog("createSpaceMetadataSuccess", { createSpaceMetadataAddress });
  };

  updateSpaceRequest = (
    updateSpaceId: string,
    updateSpaceMetadata: MetadataArgs
  ) => {
    this.sendLog("updateDaoMetadataRequest", {
      updateSpaceId,
      updateSpaceMetadata,
    });
  };

  updateSpaceSuccess = (updatedSpaceMetadataAddress?: string) => {
    this.sendLog("updateSpaceMetadataSuccess", { updatedSpaceMetadataAddress });
  };

  setUpdatedSpaceaFailed = (setUpdatedSpaceMedatataError: string) => {
    this.sendLog("setUpdatedSpaceMedatataFailed", {
      setUpdatedSpaceMedatataError,
    });
  };

  createSpaceRequest = (
    createSpaceOwnerAddress: string,
    createSpaceProposalPublisherAddress: string
  ) => {
    this.sendLog("createSpaceRequest", {
      createSpaceOwnerAddress,
      createSpaceProposalPublisherAddress,
    });
  };

  createSpaceFailed = (createSpaceError: string) => {
    this.sendLog("createSpaceFailed", { createSpaceError });
  };

  createSpaceSuccess = () => {
    this.sendLog("createSpaceSuccess");
  };

  createProposalRequest = (createProposalMetadata: ProposalMetadata) => {
    this.sendLog("createProposalRequest", { createProposalMetadata });
  };

  createProposalFailed = (createProposalError: string) => {
    this.sendLog("createProposalFailed", { createProposalError });
  };

  createProposalSuccess = (createdProposalAddress: string) => {
    this.sendLog("createProposalSuccess", { createdProposalAddress });
  };

  updateProposalRequest = (
    updateProposalAddress?: string,
    updateProposalMetadata?: ProposalMetadata
  ) => {
    this.sendLog("updateProposalRequest", {
      updateProposalMetadata,
      updateProposalAddress,
    });
  };

  updateProposalFailed = (updateProposalError: string) => {
    this.sendLog("updateProposalFailed", { updateProposalError });
  };

  updateProposalSuccess = () => {
    this.sendLog("updateProposalSuccess");
  };

  voteRequest = (voteProposalAddress: string, vote: string) => {
    this.sendLog("voteRequest", { voteProposalAddress, vote });
  };

  voteSuccess = () => {
    this.sendLog("voteSuccess", { voteSuccess: true });
  };

  voteError = (voteError: string) => this.sendLog("voteError", { voteError });

  async sendLog(state: string, values = {} as Partial<AnalyticsBody>) {
    if (!_.isEmpty(this.body.state)) {
      this.history.push(this.body.state);
    }
    this.body.state = {
      state,
      time: new Date().getTime() - this.timestamp,
    };
    if (!this.body.serverVersion) {
      this.body.serverVersion = await api.serverVersion();
    }
    this.body = { ...this.body, ...values };

    try {
      axios.post(`https://bi.orbs.network/putes/${this.endpoint}_new`, {
        ...this.body,
        history: this.history,
      });
    } catch (error) {}
  }
}

export const analytics = new Analytics();

// types
interface State {
  state: string;
  time: number;
}

interface AnalyticsBody {
  state?: State;
  _id: string;
  walletAddress?: string;
  walletName?: string;
  walletVersion?: string;
  platform?: string;
  device?: string;
  serverVersion?: string;
  sdkVerion?: string;
  daoId?: string;
  getDaoFailedError?: string;
  voteProposalAddress?: string;
  vote?: string;
  voteError?: string;
  voteSuccess?: boolean;
  createSpaceMetadata?: MetadataArgs;
  createSpaceMetadataError?: string;
  createSpaceMetadataAddress?: string;
  createSpaceOwnerAddress?: string;
  createSpaceProposalPublisherAddress?: string;
  createSpaceError?: string;
  createProposalMetadata?: ProposalMetadata;
  createdProposalAddress?: string;
  createProposalError?: string;
  updateSpaceId?: string;
  updateSpaceMetadata?: MetadataArgs;
  updateSpaceError?: string;
  updateProposalAddress?: string;
  updateProposalMetadata?: ProposalMetadata;
  updateProposalError?: string;
  verifyResultsProposalAddress?: string;
  verifyResultsError?: string;
  updatedSpaceMetadataAddress?: string;
  setUpdatedSpaceMedatataError?: string;
}
