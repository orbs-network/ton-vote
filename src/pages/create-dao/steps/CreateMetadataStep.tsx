import { Fade, styled, Typography } from "@mui/material";
import { Button, InputsForm } from "components";
import { StyledFlexColumn } from "styles";
import { FormikProps, useFormik } from "formik";
import { DaoMetadata, useCreatDaoStore, useCreateDaoMetadata } from "../store";
import _ from "lodash";
import { DaoMetadataFormSchema, useInputs } from "./form";
import { Submit } from "./Submit";
import { StyledInputs } from "../styles";
import { useEffect } from "react";
import { useDebouncedCallback } from "hooks";
import { validateFormik } from "utils";
import { useTranslation } from "react-i18next";
import { Step } from "./Step";

const useFormLanguageListeners = (formik: FormikProps<DaoMetadata>) => {
  useEffect(() => {
    formik.setFieldValue("name", JSON.stringify({ en: formik.values.name_en }));
    formik.setFieldValue(
      "about",
      JSON.stringify({
        en: formik.values.about_en,
      })
    );
  }, [formik.values]);
};

export function CreateMetadataStep() {
  const { mutate: createMetadata, isLoading } = useCreateDaoMetadata();
  const { daoMetadataForm, setDaoMetadataForm, editMode } = useCreatDaoStore();

  const { createMetadataInputs } = useInputs();

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
  useFormLanguageListeners(formik);

  const saveForm = useDebouncedCallback(() => {
    setDaoMetadataForm(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  return (
    <Step
      warning={editMode ? t("editSpaceDetailsWarning") : ""}
      title={editMode ? t("editspaceDetails") : t("createSpaceDetails")}
    >
      <StyledFlexColumn alignItems="flex-start" gap={30}>
        <StyledAbout>
          Enter all fields in English. Future versions will support adding
          translations in multiple languages. You can update these fields later.
        </StyledAbout>
        <StyledFlexColumn>
          <StyledInputs>
            <InputsForm
              inputs={createMetadataInputs}
              formik={formik}
              EndAdornment={EndAdornment}
            />
          </StyledInputs>
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
        </StyledFlexColumn>
      </StyledFlexColumn>
    </Step>
  );
}

const StyledAbout = styled(Typography)({
  fontSize: 14,
  opacity: 0.7,
});

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
