import { styled, Typography } from "@mui/material";
import { Button, MapInput } from "components";
import { useFormik } from "formik";
import { StyledFlexColumn } from "styles";
import { RolesForm, useCreatDaoStore } from "../store";
import { StyledInputs } from "../styles";
import { SetRolesFormSchema, useRolesInputs } from "./form";
import { Submit } from "./Submit";

export function SetRolesStep() {
  const { setRolesForm, rolesForm, nextStep } = useCreatDaoStore();
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
        <Button onClick={formik.submitForm}>Set Roles</Button>
      </Submit>
    </StyledFlexColumn>
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
