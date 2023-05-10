import { useTranslation } from "react-i18next";

export const useDaoPageTranslations = () => {
  const { t } = useTranslation("daoPage");

  return {
    proposals: t("proposals"),
    about: t("about"),
    newProposal: t("newProposal"),
    startIn: (value: string) => t("startIn", { value }),
    endIn: (value: string) => t("endIn", { value }),
    emptyProposals: t("emptyProposals"),
    endedAndDidntPassedQuorum: t("endedAndDidntPassedQuorum"),
    proposalEnded: (value: string) => t("proposalEnded", { value }),
    spaceNotFound: t("spaceNotFound"),
    settings: t("settings"),
  };
};
