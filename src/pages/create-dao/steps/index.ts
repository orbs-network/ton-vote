import { useTranslation } from "react-i18next";
import { CreateDaoStep } from "./CreateDaoStep";
import { CreateMetadataStep } from "./CreateMetadataStep";
import { GettingStartedStep } from "./GettingStartedStep";
import { SetRolesStep } from "./SetRolesStep";


export const useSteps = () => {
  const {t} = useTranslation()
  return [
    {
      title: t("getStarted"),
      component: GettingStartedStep,
    },
    {
      title: t("forumDetails"),
      component: CreateMetadataStep,
    },
    {
      title: t("forumStage"),
      component: SetRolesStep,
    },
    {
      title: t("createForum"),
      component: CreateDaoStep,
    },
  ];
};



