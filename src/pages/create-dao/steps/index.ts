import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { useTranslation } from "react-i18next";
import { CreateDaoStep } from "./CreateDaoStep";
import { CreateMetadataStep } from "./CreateMetadataStep";
import { GettingStartedStep } from "./GettingStartedStep";
import { SetRolesStep } from "./SetRolesStep";


export const useSteps = () => {
  const translations = useCreateDaoTranslations();
  return [
    {
      title: translations.gettingStarted,
      component: GettingStartedStep,
    },
    {
      title: translations.spaceMetadata,
      component: CreateMetadataStep,
    },
    {
      title: translations.stage,
      component: SetRolesStep,
    },
    {
      title: translations.createStage,
      component: CreateDaoStep,
    },
  ];
};



