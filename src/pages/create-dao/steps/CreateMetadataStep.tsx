import { styled, Typography } from "@mui/material";
import { Button, CheckboxInput, FormikInputsForm } from "components";
import { useFormik } from "formik";
import { useCreatDaoStore } from "../store";
import _ from "lodash";
import { Submit } from "./Submit";
import { useEffect } from "react";
import { useDebouncedCallback } from "hooks/hooks";
import { validateFormik } from "utils";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoMetadataSchema } from "forms/dao-form";
import { useDaoMetadataForm } from "../form";
import { DaoMetadataForm } from "types";
import { useCreateMetadataQuery } from "query/setters";
import { ZERO_ADDRESS } from "consts";
import { Webapp, WebappButton } from "WebApp";

export function CreateMetadataStep() {
  const { mutate: createMetadata, isLoading } = useCreateMetadataQuery();
  const store = useCreatDaoStore();
  const { daoMetadataForm } = store;
  const translations = useCreateDaoTranslations();
  const createMetadataForm = useDaoMetadataForm(store.editMode);
  const Schema = useDaoMetadataSchema();

  const onSubmit = async (formData: DaoMetadataForm) => {
    const metadata: DaoMetadataForm = {
      about: JSON.stringify({ en: formData.about_en }),
      avatar: formData.avatar || "",
      github: formData.github || "",
      hide: formData.hide,
      name: JSON.stringify({ en: formData.name_en }),
      terms: "",
      telegram: formData.telegram || "",
      website: formData.website || "",
      jetton: formData.jetton || ZERO_ADDRESS,
      nft: formData.nft || ZERO_ADDRESS,
      dns: formData.dns || "",
    };

    createMetadata({
      metadata,
      onSuccess: (address: string) => {
        store.nextStep();
        store.setDaoMetadataForm(formData);
        store.setMetadataAddress(address);
        window.scrollTo(0, 0);
      },
    });
  };

  const formik = useFormik<DaoMetadataForm>({
    initialValues: {
      name: daoMetadataForm.name,
      telegram: daoMetadataForm.telegram,
      website: daoMetadataForm.website,
      github: daoMetadataForm.github,
      about: daoMetadataForm.about,
      terms: daoMetadataForm.terms,
      avatar: daoMetadataForm.avatar,
      hide: daoMetadataForm.hide,
      jetton: daoMetadataForm.jetton,
      nft: daoMetadataForm.nft,
      dns: daoMetadataForm.dns,
      about_en: daoMetadataForm.about_en,
      name_en: daoMetadataForm.name_en,
    },
    validationSchema: Schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit,
  });

  const saveForm = useDebouncedCallback(() => {
    store.setDaoMetadataForm(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  const onSubmitClick = () => {
    formik.submitForm();
    validateFormik(formik);
  };

  const btnText = store.editMode
    ? translations.editDetails
    : translations.approveDetails;

  return (
    <FormikInputsForm<DaoMetadataForm>
      form={createMetadataForm}
      formik={formik}
      EndAdornment={EndAdornment}
    >
      <Submit>
        {Webapp.isEnabled ? (
          <WebappButton
            text={btnText}
            progress={isLoading}
            onClick={onSubmitClick}
          />
        ) : (
          <Button isLoading={isLoading} onClick={onSubmitClick}>
            {btnText}
          </Button>
        )}
      </Submit>
    </FormikInputsForm>
  );
}

const EndAdornment = ({ onClick }: { onClick: () => void }) => {
  const commonTranslations = useCommonTranslations();
  return (
    <StyledEndAdornment onClick={onClick}>
      <Typography>{commonTranslations.connectedWallet}</Typography>
    </StyledEndAdornment>
  );
};

const StyledEndAdornment = styled(Button)({
  padding: "5px 10px",
  height: "unset",
  p: {
    fontSize: 12,
    display: "inline-block",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
});
