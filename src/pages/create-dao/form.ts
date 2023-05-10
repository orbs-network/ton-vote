import { useDaoMetadataInputs, useDaoRolesInputs } from "forms/dao-form";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { DaoMetadataForm, DaoRolesForm, FormArgs, FormikInputEndAdorment } from "types";

export const useDaoMetadataForm = (
  editMode?: boolean
): FormArgs<DaoMetadataForm>[] => {
  const translations = useCreateDaoTranslations();
  const inputs = useDaoMetadataInputs();
  return [
    {
      title: editMode
        ? translations.editSpaceMetadata
        : translations.enterSpaceMetadata,
      subTitle: translations.formInfo,
      warning: editMode ? translations.editWarning : undefined,
      inputs,
    },
  ];
};

export const useDaoRolesForm = (
  EndAdornment?: FormikInputEndAdorment<DaoRolesForm>,
  editMode?: boolean,
  
): FormArgs<DaoRolesForm>[] => {
  const translations = useCreateDaoTranslations();
  const inputs = useDaoRolesInputs(EndAdornment);
  return [
    {
      title: editMode ? translations.editStage : translations.createSpace,
      subTitle: translations.formInfo,
      inputs,
    },
  ];
};
