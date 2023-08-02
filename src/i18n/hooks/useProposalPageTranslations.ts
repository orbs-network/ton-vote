import { useTranslation } from "react-i18next";

export type ProposalPageTranslations = {
  castVote: string;
  timeLeftToVote: string;
  resultsVerified: string;
  verifyingResults: string;
  failedToVerifyResults: string;
  address: string;
  vote: string;
  votingPower: string;
  date: string;
  voteStartsIn: string;
  results: string;
  recentVotes: string;
  information: string;
  startDate: string;
  endDate: string;
  snapshot: string;
  contract: string;
  votingStrategy: string;
  votes: string;
  showMore: string;
  verifyInfo: string;
  downloadCsv: string;
  showLess: string;
  yourVotingPower: string;
  choice: string;
  notEnoughVotingPower: (value: string) => string;
  confirm: string;
  noVotes: string;
  you: string;
  httpsv2Endpoint: string;
  httpsv2ApiKey: string;
  httpv4Endpoint: string;
  tonAccessEnpoint: string;
  customEndpoint: string;
  verify: string;
  rpcSelectTitle: string;
  verifyResults: string;
};


export const useProposalPageTranslations = (): ProposalPageTranslations => {
  const { t } = useTranslation("proposalPage");

  return {
    castVote: t("castVote"),
    timeLeftToVote: t("timeLeftToVote"),
    resultsVerified: t("resultsVerified"),
    verifyingResults: t("verifyingResults"),
    failedToVerifyResults: t("failedToVerifyResults"),
    address: t("address"),
    vote: t("vote"),
    votingPower: t("votingPower"),
    date: t("date"),
    voteStartsIn: t("voteStartsIn"),
    results: t("results"),
    recentVotes: t("recentVotes"),
    information: t("information"),
    startDate: t("startDate"),
    endDate: t("endDate"),
    snapshot: t("snapshot"),
    contract: t("contract"),
    votingStrategy: t("votingStrategy"),
    votes: t("votes"),
    showMore: t("showMore"),
    verifyInfo: t("verifyInfo"),
    downloadCsv: t("downloadCsv"),
    showLess: t("showLess"),
    yourVotingPower: t("yourVotingPower"),
    choice: t("choice"),
    notEnoughVotingPower: (value: string) =>
      t("notEnoughVotingPower", { value }),
    confirm: t("confirm"),
    noVotes: t("noVotes"),
    you: t("you"),
    httpsv2Endpoint: t("httpsv2Endpoint"),
    httpsv2ApiKey: t("httpsv2ApiKey"),
    httpv4Endpoint: t("httpv4Endpoint"),
    tonAccessEnpoint: t("tonAccessEnpoint"),
    customEndpoint: t("customEndpoint"),
    verify: t("verify"),
    rpcSelectTitle: t("rpcSelectTitle"),
    verifyResults: t("verifyResults"),
  };
};
