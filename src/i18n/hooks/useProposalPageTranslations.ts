import { useTranslation } from "react-i18next";

export const useProposalPageTranslations = () => {
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
