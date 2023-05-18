import { styled, Typography } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { Button, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import { useDaoRolesSchema } from "forms/dao-form";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { StyledEndAdornment } from "styles";
import { DaoRolesForm } from "types";
import { validateFormik } from "utils";
import { useDaoRolesForm } from "../form";
import { useCreatDaoStore } from "../store";
import { Submit } from "./Submit";

export function SetRolesStep() {
  const { setRolesForm, rolesForm, nextStep, editMode } = useCreatDaoStore();
  const Schema = useDaoRolesSchema();
  const form = useDaoRolesForm(EndAdornment, editMode);
  const translations = useCommonTranslations();
  const formik = useFormik<DaoRolesForm>({
    initialValues: {
      ownerAddress: rolesForm.ownerAddress,
      proposalOwner: rolesForm.proposalOwner,
    },
    validationSchema: Schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      setRolesForm(values);
      nextStep();
    },
  });

  return (
    <FormikInputsForm<DaoRolesForm> form={form} formik={formik}>
      <Submit>
        <Button
          onClick={() => {
            formik.submitForm();
            validateFormik(formik);
          }}
        >
          {translations.next}
        </Button>
      </Submit>
    </FormikInputsForm>
  );
}

const EndAdornment = ({
  name,
  formik,
}: {
  name: string;
  formik: FormikProps<DaoRolesForm>;
}) => {
  const translations = useCommonTranslations();
  const address = useTonAddress();

  const onClick = () => {
    formik.setFieldError(name, undefined);
    formik.setFieldValue(name, address);
  };

  if (!address || formik.values[name as keyof DaoRolesForm] === address)
    return null;
  return (
    <StyledEndAdornment>
      <Button onClick={onClick}>
        <Typography>{translations.connectedWallet}</Typography>
      </Button>
    </StyledEndAdornment>
  );
};
