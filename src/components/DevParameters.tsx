import { Box, Chip, CircularProgress, styled, Typography } from "@mui/material";
import { FormikProps, useFormik } from "formik";
import React, { useState } from "react";
import { StyledEndAdornment, StyledFlexColumn } from "styles";
import { FormArgs, FormikInputEndAdorment } from "types";
import { Button } from "./Button";
import { Popup } from "./Popup";
import { FormikInputsForm } from "./inputs/Inputs";
import { validateAddress } from "utils";
import { AppTooltip } from "./Tooltip";
import { FiSettings } from "react-icons/fi";
import _ from "lodash";
import { showErrorToast } from "toasts";
import {
  useDaoAddressFromQueryParam,
  useDevFeatures,
  useParseError,
} from "hooks";
import { useMutation } from "@tanstack/react-query";
import { useConnection } from "ConnectionProvider";
import {
  useDaosQuery,
  useGetCreateDaoFeeQuery,
  useGetDaoFwdMsgFeeQuery,
  useGetRegistryAdminQuery,
  useGetRegistryIdQuery,
} from "query/getters";
import {
  useSetCreateDaoFee,
  useSetDaoFwdMsgFee,
  useSetRegistryAdmin,
} from "query/setters";

const useValidateFields = () => {
  const registryAdmin = useGetRegistryAdminQuery().data;
  const connectedAddress = useConnection().address;
  return (name: string, value: any) => {
    if (!connectedAddress) {
      throw new Error("Please connect your wallet");
    }
    if (connectedAddress !== registryAdmin) {
      throw new Error("You are not the registry admin");
    }
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
  const { mutateAsync: setCreateProposalFee } = useSetDaoFwdMsgFee();
  const daos = useDaosQuery().data;

  const validate = useValidateFields();
  return useMutation(
    async () => {
      validate(name, value);
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
  const initialValue = formik.initialValues[name as keyof IForm];
  const { mutateAsync: setCreateDaoFee, isLoading: createDaoFeeLoading } =
    useSetCreateDaoFee();
  const { mutateAsync: setRegistryAdmin, isLoading: setAdminLoading } =
    useSetRegistryAdmin();
  const { mutateAsync: setCreateProposalFee, isLoading: daoFwdFeeLoading } =
    useSetDaoFwdMsgFee();
  const { refetch: refetchCreateDaoFee } = useGetCreateDaoFeeQuery();
  const { refetch: refetchRegistryAdmin } = useGetRegistryAdminQuery();
  const daoAddress = useDaoAddressFromQueryParam();
  const { refetch: refetchFwdMsgFee } = useGetDaoFwdMsgFeeQuery(daoAddress);

  const daos = useDaosQuery().data;

  const onSubmit = () => {
    const onError = (error: string) => formik.setFieldError(name, error);

    if (name === "createDaoFee") {
      return setCreateDaoFee({
        value: value as number,
        onSuccess: refetchCreateDaoFee,
        onError,
      });
    }
    if (name === "registryAdmin") {
      return setRegistryAdmin({
        value: value! as string,
        onSuccess: refetchRegistryAdmin,
        onError,
      });
    }
    if (name === "fwdMsgFee") {
      return setCreateProposalFee({
        daoIds: daos!.map((dao) => dao.daoId!),
        amount: value as number,
        onSuccess: refetchFwdMsgFee,
        onError,
      });
    }
  };

  const isLoading = () => {
    if (name === "createDaoFee") {
      return createDaoFeeLoading;
    }
    if (name === "registryAdmin") {
      return setAdminLoading;
    }
    if (name === "fwdMsgFee") {
      return daoFwdFeeLoading;
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
    {
      name: "fwdMsgFee",
      label: "Forward Message Fee",
      type: "number",
      EndAdornment: EndAdornment as FormikInputEndAdorment<IForm>,
    },
  ],
};

export function DevParametersModal() {
  const [open, setOpen] = useState(false);
  const createDaoFee = useGetCreateDaoFeeQuery().data;
  const registryAdmin = useGetRegistryAdminQuery().data;
  const registryId = useGetRegistryIdQuery().data;
  const { isLoading: daosLoading } = useDaosQuery();
  const show = useDevFeatures();
  const formik = useFormik<IForm>({
    enableReinitialize: true,
    initialValues: {
      createDaoFee: Number(createDaoFee),
      registryAdmin: registryAdmin,
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
