import { useTranslation } from "react-i18next";

export const useDaosPageTranslations = () => {
  const { t } = useTranslation("daosPage");

  return {
    daos: t("daos"),
    spaces: t("spaces"),
    noSpaces: t("noSpaces"),
    searchForDAO: t("searchForDAO"),
    createDao: t("createDao"),
  };
};
