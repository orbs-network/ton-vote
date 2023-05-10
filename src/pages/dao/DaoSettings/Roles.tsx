import { Fade, styled, Typography } from "@mui/material";
import { Button, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useDebouncedCallback, useParseError } from "hooks";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoRolesSchema } from "forms/dao-form";
import { useDaoFromQueryParam } from "query/queries";
import { useRolesForm } from "./form";
import { DaoRolesForm } from "types";
import { useUpdateDaoOwner, useUpdateDaoPublisher } from "../hooks";
import { validateAddress, validateFormik } from "utils";
import { StyledEndAdornment } from "styles";
import { useMutation } from "@tanstack/react-query";
import { showErrorToast } from "toasts";

const useValidateFields = () => {
  return (name: string, value?: any) => {
    if (name === "ownerAddress") {
      if (!value) {
        throw new Error("Owner address is required");
      }
      if (!validateAddress(value)) {
        throw new Error("Invalid owner address");
      }
    }
    if (name === "proposalOwner") {
      if (!value) {
        throw new Error("Proposal owner address is required");
      }
      if (!validateAddress(value)) {
        throw new Error("Invalid proposal owner address");
      }
    }
  };
};

const useUpdate = (
  formik: FormikProps<DaoRolesForm>,
  name: string,
  value?: any
) => {
  const { mutateAsync: setOwner } = useUpdateDaoOwner();
  const { mutateAsync: setPublisher } = useUpdateDaoPublisher();
  const parseError = useParseError();
  const { refetch: refetchDao } = useDaoFromQueryParam();
  const validate = useValidateFields();

  return useMutation(
    async () => {
      validate(name, value);
      if (name === "ownerAddress") {
        return setOwner(value);
      }
      if (name === "proposalOwner") {
        return setPublisher(value);
      }
    },
    {
      onSuccess: () => refetchDao(),
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

export function RolesForm() {
  const form = useRolesForm(EndAdornment);
  const dao = useDaoFromQueryParam().data;

  const formik = useFormik<DaoRolesForm>({
    initialValues: {
      ownerAddress: dao?.daoRoles.owner || "",
      proposalOwner: dao?.daoRoles.proposalOwner || "",
    },
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {},
  });

  return (
    <FormikInputsForm<DaoRolesForm>
      form={form}
      formik={formik}
    ></FormikInputsForm>
  );
}

export const EndAdornment = ({
  name,
  formik,
}: {
  name: string;
  formik: FormikProps<DaoRolesForm>;
}) => {
  const value = formik.values[name as keyof DaoRolesForm];
  const initialValue = formik.initialValues[name as keyof DaoRolesForm];

  const { mutate, isLoading } = useUpdate(formik, name, value);

  if (initialValue === value) return null;

  return (
    <StyledEndAdornment>
      <Button onClick={mutate} isLoading={isLoading}>
        <Typography>Update</Typography>
      </Button>
    </StyledEndAdornment>
  );
};
