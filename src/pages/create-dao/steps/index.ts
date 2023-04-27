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
      title: t("spaceDetails"),
      component: CreateMetadataStep,
    },
    {
      title: t("spacestage"),
      component: SetRolesStep,
    },
    {
      title: t("createSpace"),
      component: CreateDaoStep,
    },
  ];
};



