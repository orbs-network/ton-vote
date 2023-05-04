import { Fade, styled, Typography } from "@mui/material";
import { Button, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import { DaoMetadata, useCreatDaoStore, useCreateDaoMetadata } from "../store";
import _ from "lodash";
import { DaoMetadataFormSchema, useInputs } from "./form";
import { Submit } from "./Submit";
import { useEffect } from "react";
import { useDebouncedCallback } from "hooks";
import { validateFormik } from "utils";
import { useTranslation } from "react-i18next";

export function CreateMetadataStep() {
  const { mutate: createMetadata, isLoading } = useCreateDaoMetadata();
  const { daoMetadataForm, setDaoMetadataForm, editMode } = useCreatDaoStore();

  const { createMetadataForm } = useInputs(editMode);

  const onSubmit = async (_formData: DaoMetadata) => {
    createMetadata(_formData);
  };

  const formik = useFormik<DaoMetadata>({
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
    validationSchema: DaoMetadataFormSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit,
  });

  const { t } = useTranslation();

  const saveForm = useDebouncedCallback(() => {
    setDaoMetadataForm(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  return (
    <FormikInputsForm<DaoMetadata>
      form={createMetadataForm}
      formik={formik}
      EndAdornment={EndAdornment}
    >
      <Submit>
        <Button
          isLoading={isLoading}
          onClick={() => {
            formik.submitForm();
            validateFormik(formik);
          }}
        >
          {editMode ? t("editDetails") : t("approveDetails")}
        </Button>
      </Submit>
    </FormikInputsForm>
  );
}

const EndAdornment = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <StyledEndAdornment onClick={onClick}>
      <Typography>{t("connectedWallet")}</Typography>
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
