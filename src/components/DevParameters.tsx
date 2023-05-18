import { Box, Chip, CircularProgress, styled, Typography } from "@mui/material";
import { FormikProps, useFormik } from "formik";
import React, { useState } from "react";
import { StyledEndAdornment, StyledFlexColumn } from "styles";
import { FormArgs, FormikInputEndAdorment } from "types";
import { Button } from "./Button";
import { Popup } from "./Popup";
import { FormikInputsForm } from "./inputs/Inputs";
import { AppTooltip } from "./Tooltip";
import { FiSettings } from "react-icons/fi";
import _ from "lodash";
import { useDevFeatures } from "hooks";
import {
  useDaosQuery,
  useGetCreateDaoFeeQuery,
  useGetRegistryAddressQuery,
  useGetRegistryAdminQuery,
  useGetRegistryIdQuery,
} from "query/getters";
import {
  useCreateNewRegistry,
  useSetCreateDaoFee,
  useSetDaoFwdMsgFee,
  useSetRegistryAdmin,
} from "query/setters";

const EndAdornment = ({
  name,
  formik,
}: {
  name: string;
  formik: FormikProps<IForm>;
}) => {
  const value = formik.values[name as keyof IForm];
  const initialValue = formik.initialValues[name as keyof IForm];
  const { mutateAsync: setCreateDaoFee, isLoading: createDaoFeeLoading } =
    useSetCreateDaoFee();
  const { mutateAsync: setRegistryAdmin, isLoading: setAdminLoading } =
    useSetRegistryAdmin();
  const { mutateAsync: setCreateProposalFee, isLoading: daoFwdFeeLoading } =
    useSetDaoFwdMsgFee();

  const { mutate: createNewRegistry, isLoading: newRegistryLoading } =
    useCreateNewRegistry();

  const daos = useDaosQuery().data;

  const onSubmit = () => {
    const onError = (error: string) => formik.setFieldError(name, error);

    if (name === "createDaoFee") {
      return setCreateDaoFee({
        value: value as number,
        onError,
      });
    }
    if (name === "registryAdmin") {
      return setRegistryAdmin({
        newRegistryAdmin: value! as string,
        onError,
      });
    }
    if (name === "fwdMsgFee") {
      return setCreateProposalFee({
        daoIds: daos!.map((dao) => dao.daoId!),
        amount: value as number,
        onError,
      });
    }
     if (name === "newRegistry") {
       return createNewRegistry(value as number);
     }
  };

  const isLoading = () => {
    switch (name) {
      case "createDaoFee":
        return createDaoFeeLoading;
      case "registryAdmin":
        return setAdminLoading;
      case "fwdMsgFee":
        return daoFwdFeeLoading;
      case "newRegistry":
        return newRegistryLoading;

      default:
        return false;
    }
  };

  if (initialValue === value) return null;
  return (
    <StyledEndAdornment>
      <Button onClick={onSubmit} isLoading={isLoading()}>
        <Typography>update</Typography>
      </Button>
    </StyledEndAdornment>
  );
};

interface IForm {
  createDaoFee?: number;
  registryAdmin?: string;
  registryAddress?: string;
}

const form: FormArgs<IForm> = {
  title: "",
  inputs: [
    {
      label: "Registry address",
      type: "text",
      name: "registryAddress",
      disabled: true,
    },
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
    {
      name: "fwdMsgFee",
      label: "Forward Message Fee",
      type: "number",
      EndAdornment: EndAdornment as FormikInputEndAdorment<IForm>,
    },
    {
      name: "newRegistry",
      label: "Create Registry",
      type: "text",
      EndAdornment: EndAdornment as FormikInputEndAdorment<IForm>,
    },
  ],
};

export function DevParametersModal() {
  const [open, setOpen] = useState(false);
  const createDaoFee = useGetCreateDaoFeeQuery().data;
  const registryAdmin = useGetRegistryAdminQuery().data;
  const registryId = useGetRegistryIdQuery().data;
  const registryAddress = useGetRegistryAddressQuery().data;
  const { isLoading: daosLoading } = useDaosQuery();
  const show = useDevFeatures();
  const formik = useFormik<IForm>({
    enableReinitialize: true,
    initialValues: {
      createDaoFee: Number(createDaoFee),
      registryAdmin: registryAdmin,
      registryAddress: registryAddress,
    },
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {},
  });

  if (!show) return null;

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
        <>
          <StyledFlexColumn
            alignItems="flex-start"
            gap={20}
            style={{ opacity: daosLoading ? 0.5 : 1 }}
          >
            <StyledRegistryID label={`Registry ID: ${registryId}`} />
            <FormikInputsForm<IForm>
              form={form}
              formik={formik}
            ></FormikInputsForm>
          </StyledFlexColumn>
          {daosLoading && (
            <StyledSpinner>
              <CircularProgress size={50} />
            </StyledSpinner>
          )}
        </>
      </StyledPoup>
    </>
  );
}

const StyledRegistryID = styled(Chip)({});

const StyledSpinner = styled(Box)({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
});

const StyledButton = styled(Button)({
  width: 40,
  height: 40,
  padding: 0,
});

const StyledPoup = styled(Popup)({
  ".input-title-required": {
    display: "none",
  },
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
