import { routes } from "consts";
import { useCreatDaoStore } from "./store";
import { Page } from "wrappers";
import { StepsLayout } from "components";
import { StepsMenuStep } from "types";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { GettingStartedStep } from "./steps/GettingStartedStep";
import { CreateMetadataStep } from "./steps/CreateMetadataStep";
import { SetRolesStep } from "./steps/SetRolesStep";
import { CreateDaoStep } from "./steps/CreateDaoStep";

export const useSteps = (): StepsMenuStep[] => {
  const translations = useCreateDaoTranslations();
  return [
    {
      title: translations.gettingStarted,
      component: GettingStartedStep,
    },
    {
      title: translations.spaceMetadata,
      component: CreateMetadataStep,
      editable: true,
    },
    {
      title: translations.stage,
      component: SetRolesStep,
      editable: true,
    },
    {
      title: translations.createSpace,
      component: CreateDaoStep,
    },
  ];
};

export function CreateDao() {
  const { step: currentStep, setStep, setEditMode } = useCreatDaoStore();
  const steps = useSteps();
  return (
    <Page hideBack>
      <StepsLayout
        steps={steps}
        currentStep={currentStep}
        setStep={setStep}
        onEdit={() => setEditMode(true)}
      />
    </Page>
  );
}

export default CreateDao;
