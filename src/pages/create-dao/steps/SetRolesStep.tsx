import { styled, Typography } from "@mui/material";
import { Button, InputsForm, MapInput } from "components";
import { useFormik } from "formik";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { StyledFlexColumn } from "styles";
import { validateFormik } from "utils";
import { RolesForm, useCreatDaoStore } from "../store";
import { StyledInputs } from "../styles";
import { SetRolesFormSchema, useInputs } from "./form";
import { Step } from "./Step";
import { Submit } from "./Submit";

export function SetRolesStep() {
  const { setRolesForm, rolesForm, nextStep, editMode } = useCreatDaoStore();
  const { t } = useTranslation();
  const { setRolesInputs } = useInputs();

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
    <Step title={editMode ? t("editForumStage") : t("createForumStage")}>
      <StyledFlexColumn>
        <StyledInputs>
          <InputsForm
            inputs={setRolesInputs}
            EndAdornment={EndAdornment}
            formik={formik}
          />
        </StyledInputs>
        <Submit>
          <Button
            onClick={() => {
              formik.submitForm();
              validateFormik(formik);
            }}
          >
            {t("registerForum")}
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
