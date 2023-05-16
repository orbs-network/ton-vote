import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const useCreateProposalTranslations = () => {
  const { t } = useTranslation("createProposal");

  return useMemo(() => {
    return {
      votingParameters: t("votingParameters"),
      formTitle: t("createProposal"),
      subTitle: t("subTitle"),
      title: t("title"),
      description: t("description"),
      votingPowerStrategy: t("votingPowerStrategy"),
      jettonAddress: t("jettonAddress"),
      votingChoices: t("votingChoices"),
      votingPeroid: t("votingPeroid"),
      votingPeriodInfo: t("votingPeriodInfo"),
      startTime: t("startTime"),
      endTime: t("endTime"),
      snaphotTime: t("snaphotTime"),
      proposalDuration: t("proposalDuration"),
      nftAddress: t("nftAddress"),
      tooltips: {
        title: t("tooltips.title"),
        description: t("tooltips.description"),
        votingPowerStrategy: t("tooltips.votingPowerStrategy"),
        jettonAddress: t("tooltips.jettonAddress"),
        votingChoices: t("tooltips.votingChoices"),
        startTime: t("tooltips.startTime"),
        endTime: t("tooltips.endTime"),
        snapshotTime: t("tooltips.snapshotTime"),
      },
      errors: {
        isRequired: (value: string) => t("errors.isRequired", { value }),
        titleLength: t("errors.titleLength", { value: TITLE_LIMIT }),
        aboutLength: t("errors.aboutLength", { value: ABOUT_CHARS_LIMIT }),
        invalidJettonAddress: t("errors.invalidJettonAddress"),
        invalidNFTAddress: t("errors.invalidNFTAddress"),
        startTime1: t("errors.startTime1"),
        startTime2: t("errors.startTime2"),
        endTime1: t("errors.endTime1"),
        endTime2: t("errors.endTime2"),
        endTime3: t("errors.endTime3"),
        snapshotTime1: t("errors.snapshotTime1"),
      },
    };
  }, [t]);
};
