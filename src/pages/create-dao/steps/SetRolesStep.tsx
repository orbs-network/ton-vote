import { styled, Typography } from "@mui/material";
import { Button, MapInput } from "components";
import { useFormik } from "formik";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { StyledFlexColumn } from "styles";
import { showErrorToast, showSuccessToast } from "toasts";
import { validateFormik } from "utils";
import { RolesForm, useCreatDaoStore } from "../store";
import { StyledInputs } from "../styles";
import { SetRolesFormSchema, useRolesInputs } from "./form";
import { Step } from "./Step";
import { Submit } from "./Submit";

export function SetRolesStep() {
  const { setRolesForm, rolesForm, nextStep, editMode } = useCreatDaoStore();
  const {t} = useTranslation()
  const inputs = useRolesInputs();

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
          {inputs.map((input) => {
            return (
              <MapInput<RolesForm>
                EndAdornment={EndAdornment}
                key={input.name}
                input={input}
                formik={formik}
              />
            );
          })}
        </StyledInputs>
        <Submit>
          <Button
            onClick={() => {
              formik.submitForm();
              validateFormik(formik);
            }}
          >
            {editMode ? t("editForum") : t("Register Forum")}
          </Button>
        </Submit>
      </StyledFlexColumn>
    </Step>
  );
}

const EndAdornment = ({ onClick }: { onClick: () => void }) => {
  return (
    <StyledEndAdornment onClick={onClick}>
      <Typography>Conneted wallet</Typography>
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
