import { styled, Typography } from "@mui/material";
import { Button, FormikInputsForm, MapInput } from "components";
import { useFormik } from "formik";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { validateFormik } from "utils";
import { useInputs } from "../form/inputs";
import { useSetRolesFormSchema } from "../form/validation";
import { RolesForm, useCreatDaoStore } from "../store";
import { Submit } from "./Submit";

export function SetRolesStep() {
  const { setRolesForm, rolesForm, nextStep, editMode } = useCreatDaoStore();
  const Schema = useSetRolesFormSchema();
  const form = useInputs(editMode).setRolesForm;
  const translations = useCommonTranslations()
  const formik = useFormik<RolesForm>({
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
    <FormikInputsForm<RolesForm>
      form={form}
      EndAdornment={EndAdornment}
      formik={formik}
    >
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

const EndAdornment = ({ onClick }: { onClick: () => void }) => {
  const translations = useCommonTranslations()
  return (
    <StyledEndAdornment onClick={onClick}>
      <Typography>{translations.connectedWallet}</Typography>
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
