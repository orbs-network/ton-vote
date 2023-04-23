import { Fade, styled, Typography } from "@mui/material";
import {
  Button,
  Container,
  FadeElement,
  Header,
  MapInput,
  TitleContainer,
} from "components";
import { StyledFlexColumn } from "styles";
import { FormikValues, useFormik } from "formik";
import {
  DaoMetadata,
  useCompareDaoMetadataForm,
  useCreatDaoStore,
  useCreateDaoMetadata,
} from "../store";
import _ from "lodash";
import { DaoMetadataFormSchema, createDaoMetadataInputs } from "./form";
import { Submit } from "./Submit";
import { StyledInputs } from "../styles";
import { useEffect } from "react";
import { useDebouncedCallback } from "hooks";
import { validateFormik } from "utils";
import { useTranslation } from "react-i18next";
import { Step } from "./Step";

export function CreateMetadataStep() {
  const { mutate: createMetadata, isLoading } = useCreateDaoMetadata();
  const { daoMetadataForm, setDaoMetadataForm, editMode } = useCreatDaoStore();

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
    <Step
      warning={editMode ? t("editForumDetailsWarning") : ""}
      title={editMode ? t("editForumDetails") : t("createForumDetails")}
    >
      <StyledFlexColumn>
        <StyledInputs>
          {createDaoMetadataInputs.map((input) => {
            return (
              <MapInput<DaoMetadata>
                key={input.name}
                input={input}
                formik={formik}
                EndAdornment={EndAdornment}
              />
            );
          })}
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
    </Step>
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
