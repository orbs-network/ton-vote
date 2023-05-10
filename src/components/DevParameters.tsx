import { styled, Typography } from "@mui/material";
import { getRelaseMode } from "config";
import { FormikProps, useFormik } from "formik";
import React, { useState } from "react";
import { StyledEndAdornment } from "styles";
import { ReleaseMode } from "ton-vote-contracts-sdk";
import { FormArgs } from "types";
import { Button } from "./Button";
import { Popup } from "./Popup";
import { useSetCreateDaoFee, useSetRegistryAdmin } from "query/queries";
import { FormikInputsForm } from "./inputs/Inputs";
import { validateAddress } from "utils";
import { AppTooltip } from "./Tooltip";
import { FiSettings } from "react-icons/fi";
import _ from "lodash";
import { showErrorToast } from "toasts";
import { useParseError } from "hooks";
import { useMutation } from "@tanstack/react-query";

const useValidateFields = () => {
  return (name: string, value: any) => {
    if (name === "createDaoFee") {
      if (!value) {
        throw new Error("Create Dao fee is required");
      }
    } else if (name === "registryAdmin") {
      if (!value) {
        throw new Error("Registry admin is required");
      }
      if (!validateAddress(value! as string)) {
        throw new Error("Registry admin is invalid");
      }
    }
  };
};

const useUpdate = (formik: FormikProps<IForm>, name: string, value?: any) => {
  const { mutateAsync: setCreateDaoFee } = useSetCreateDaoFee();
  const { mutateAsync: setRegistryAdmin } = useSetRegistryAdmin();
  const parseError = useParseError();

  const validate = useValidateFields();
  return useMutation(
    async () => {
      validate(name, value);
      if (name === "createDaoFee") {
        return setCreateDaoFee(value! as number);
      }
      if (name === "registryAdmin") {
        return setRegistryAdmin(value! as string);
      }
    },
    {
      onError: (error) => {
        if (error instanceof Error) {
          const parsedError = parseError(error.message);
          formik.setFieldError(name, parsedError);
          showErrorToast(parsedError);
        }
      },
    }
  );
};

const EndAdornment = ({
  name,
  formik,
}: {
  name: string;
  formik: FormikProps<IForm>;
}) => {
  const value = formik.values[name as keyof IForm];

  const { mutate, isLoading } = useUpdate(formik, name, value);

  return (
    <StyledEndAdornment>
      <Button onClick={mutate} isLoading={isLoading}>
        <Typography>update</Typography>
      </Button>
    </StyledEndAdornment>
  );
};

interface IForm {
  createDaoFee?: number;
  registryAdmin?: string;
}

const form: FormArgs<IForm> = {
  title: "",
  inputs: [
    {
      label: "Create DAO fee",
      type: "number",
      name: "createDaoFee",
      EndAdornment,
      required: true,
    },
    {
      label: "Registry admin",
      type: "address",
      name: "registryAdmin",
      EndAdornment,
      required: true,
    },
  ],
};

export function DevParametersModal() {
  const [open, setOpen] = useState(false);
  const formik = useFormik<IForm>({
    initialValues: {
      createDaoFee: undefined,
      registryAdmin: undefined,
    },
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {},
  });

  if (getRelaseMode() !== ReleaseMode.DEVELOPMENT) return null;

  return (
    <>
      <AppTooltip placement="right" text="Dev parameters">
        <StyledButton onClick={() => setOpen(true)}>
          <FiSettings />
        </StyledButton>
      </AppTooltip>
      <StyledPoup
        title="Dev parameters"
        open={open}
        onClose={() => setOpen(false)}
      >
        <FormikInputsForm<IForm> form={form} formik={formik}></FormikInputsForm>
      </StyledPoup>
    </>
  );
}

const StyledButton = styled(Button)({
  width: 40,
  height: 40,
  padding: 0,
});

const StyledPoup = styled(Popup)({
  maxWidth: 600,
  paddingBottom: 20,
  ".formik-form": {
    border: "unset",
    boxShadow: "unset",
    " .title-container-children": {
      padding: 0,
    },
  },
});
