import { Fade, styled, Typography } from "@mui/material";
import { Button, ConnectButton, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import _ from "lodash";
import { useEffect } from "react";
import { useDebouncedCallback } from "hooks";
import { isZeroAddress, parseLanguage } from "utils";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoMetadataSchema } from "forms/dao-form";
import { useDaoFromQueryParam } from "query/queries";
import { useMetadataForm } from "./form";
import { DaoMetadataForm } from "types";
import { useUpdateDaoMetadata } from "../hooks";
import { StyledFlexRow } from "styles";
import { useConnection } from "ConnectionProvider";

export function MetadataForm() {
  const Schema = useDaoMetadataSchema();
  const updateDaoForm = useMetadataForm();
  const daoMetadata = useDaoFromQueryParam().data?.daoMetadata;
  const { mutate, isLoading } = useUpdateDaoMetadata();

  const formik = useFormik<DaoMetadataForm>({
    initialValues: {
      name: daoMetadata?.name || "",
      telegram: daoMetadata?.telegram || "",
      website: daoMetadata?.website || "",
      github: daoMetadata?.github || "",
      about: daoMetadata?.about || "",
      terms: daoMetadata?.terms || "",
      avatar: daoMetadata?.avatar || "",
      hide: daoMetadata?.hide || false,
      jetton: isZeroAddress(daoMetadata?.jetton)
        ? ""
        : daoMetadata?.jetton || "",
      nft: isZeroAddress(daoMetadata?.nft) ? "" : "",
      dns: daoMetadata?.dns || "",
      about_en: parseLanguage(daoMetadata?.about) || "",
      name_en: parseLanguage(daoMetadata?.name) || "",
    },
    validationSchema: Schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => mutate(values),
  });

  return (
    <FormikInputsForm<DaoMetadataForm> form={updateDaoForm} formik={formik}>
      <SubmitButton isLoading={isLoading} formik={formik} />
    </FormikInputsForm>
  );
}

const SubmitButton = ({
  isLoading,
  formik,
}: {
  isLoading: boolean;
  formik: FormikProps<DaoMetadataForm>;
}) => {
  const connectedAddress = useConnection().address;

  const hide = _.isEqual(formik.values, formik.initialValues)

  if (hide) return null
    return (
      <StyledSubmit>
        {!connectedAddress ? 
          <ConnectButton />
        : <Button isLoading={isLoading} onClick={formik.submitForm}>
          Update Metadata
        </Button>}
      </StyledSubmit>
    );
};

const StyledSubmit = styled(StyledFlexRow)({
  marginTop: 40,
});
