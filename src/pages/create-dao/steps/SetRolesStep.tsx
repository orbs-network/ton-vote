import { styled, Typography } from "@mui/material";
import { Button, FormikInputsForm, MapInput } from "components";
import { useFormik } from "formik";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { validateFormik } from "utils";
import { RolesForm, useCreatDaoStore } from "../store";
import { SetRolesFormSchema, useInputs } from "./form";
import { Submit } from "./Submit";

export function SetRolesStep() {
  const { setRolesForm, rolesForm, nextStep, editMode } = useCreatDaoStore();
  const form = useInputs(editMode).setRolesForm;

  const formik = useFormik<RolesForm>({
    initialValues: {
      ownerAddress: rolesForm.ownerAddress,
      proposalOwner: rolesForm.proposalOwner,
    },
    validationSchema: SetRolesFormSchema,
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
          Next
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
