import { useTranslation } from "react-i18next";

export const useCommonTranslations = () => {
  const { t } = useTranslation("common");

  return {
    isRequired: (value: string) => t("isRequired", { value }),
    isInvalid: (value: string) => t("isInvalid", { value }),
    edit: t("edit"),
    connectedWallet: t("connectedWallet"),
    create: t("create"),
    tonBalance: t("tonBalance"),
    jettonBalance: t("jettonBalance"),
    nftCollection: t("nftCollection"),
    copyAddress: t("copyAddress"),
    logout: t("logout"),
    ended: t("ended"),
    notStarted: t("notStarted"),
    all: t("all"),
    active: t("active"),
    back: t("back"),
    checkWallet: t("checkWallet"),
    selectWallet: t("selectWallet"),
    members: t("members"),
    loadMore: t("loadMore"),
    administrators: t("administrators"),
    daoSpaceOwner: t("daoSpaceOwner"),
    proposalPublisher: t("proposalPublisher"),
    search: t("search"),
    preview: t("preview"),
    help: t("help"),
    close: t("close"),
    connectWallet: t("connectWallet"),
    next: t("next"),
    transactionRejected: t("transactionRejected"),
    somethingWentWrong: t("somethingWentWrong"),
    txPending: t("txPending"),
    checkWalletForTx: t("checkWalletForTx"),
  };
};
