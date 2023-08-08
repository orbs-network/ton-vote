import { useTranslation } from "react-i18next";

export const useAirdropTranslations = () => {
  const { t } = useTranslation("airdrop");

  return {
    gettingStartedBody: t("gettingStarted.body"),
    titles: {
      selectedAssetCategory: t("titles.selectedAssetCategory"),
      gettingStarted: t("titles.gettingStarted"),
      generateDstWallets: t("titles.generateDstWallets"),
      transferAssets: t('titles.transferAssets'),
    },
    jettonWalletAddress: {
      title: t("jettonWalletAddress.title"),
      tooltip: t("jettonWalletAddress.tooltip"),
    },
    totalJettonAmount: {
      title: t("totalJettonAmount.title"),
      tooltip: t("totalJettonAmount.tooltip"),
    },
    subtitles: {
      generateDstWallets: t("subtitles.generateDstWallets"),
    },
    disabledSpace: t("disabledSpace"),
    errors: {
      maxVotersAmount: (amount: string) =>
        t("errors.maxVotersAmount", { value: amount }),
    },
    randomVotersAmount: t("randomVotersAmount"),
  };
};
