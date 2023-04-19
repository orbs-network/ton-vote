import { styled, Typography } from "@mui/material";
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
  DaoMetadataForm,
  useCreatDaoStore,
  useCreateDaoMetadata,
} from "../store";
import _ from "lodash";
import { createDaoMetadataInputs, DaoMetadataFormSchema } from "./form";
import { Submit } from "./Submit";
import { StyledInputs } from "../styles";
import { useCallback, useEffect } from "react";
import { useDebounce, useDebouncedCallback } from "hooks";
import { showErrorToast } from "toasts";
import { validateFormik } from "utils";

export function CreateMetadataStep() {
  const { mutate: createMetadata, isLoading } = useCreateDaoMetadata();
  const { daoMetadataForm, nextStep, metadataAddress, setDaoMetadataForm } =
    useCreatDaoStore();

  const onSubmit = async (_formData: DaoMetadataForm) => {
    const valuesChanged =
      metadataAddress && !_.isEqual(_formData, daoMetadataForm);

    if (!metadataAddress || valuesChanged) {
      createMetadata(_formData);
    } else {
      nextStep();
    }
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
    },
    validationSchema: DaoMetadataFormSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit,
  });


  const saveForm = useDebouncedCallback(() => {
    setDaoMetadataForm(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  return (
    <FadeElement show={true}>
      <StyledFlexColumn>
        <StyledInputs>
          {createDaoMetadataInputs.map((input) => {
            return (
              <MapInput<DaoMetadataForm>
                key={input.name}
                input={input}
                formik={formik}
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
            Create metadata
          </Button>
        </Submit>
      </StyledFlexColumn>
    </FadeElement>
  );
}
