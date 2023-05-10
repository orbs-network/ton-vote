import { Typography } from "@mui/material";
import { Button, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import _ from "lodash";
import { useDaoAddressFromQueryParam, useParseError } from "hooks";
import {
  useDaoFromQueryParam,
  useGetDaoFwdMsgFee,
  useSetDaoFwdMsgFee,
} from "query/queries";
import { FormArgs, FormikInputEndAdorment } from "types";
import { StyledEndAdornment } from "styles";
import { useMutation } from "@tanstack/react-query";
import { showErrorToast } from "toasts";

const useValidateFields = () => {
  return (name: string, value?: any) => {
    if (name === "fwdMsgFee") {
      if (!_.isNumber(value)) {
        throw new Error("Forward Message Fee is required");
      }
      if (value < 0) {
        throw new Error("Forward Message Fee must be at least 0");
      }
    }
  };
};

const useUpdate = (formik: FormikProps<IForm>, name: string, value?: any) => {
  const parseError = useParseError();
  const { data } = useDaoFromQueryParam();
  const validate = useValidateFields();
  const daoAddress = useDaoAddressFromQueryParam();
  const { mutateAsync: setCreateProposalFee } = useSetDaoFwdMsgFee(daoAddress);

  return useMutation(
    async () => {
      validate(name, value);

      if (name === "fwdMsgFee") {
        const res = await setCreateProposalFee({
          daoIds: [data?.daoId!],
          amount: value,
        });
        return res;
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

interface IForm {
  fwdMsgFee?: number;
}

const useForm = (): FormArgs<IForm> => {
  return {
    title: "Dao Admin Settings",
    inputs: [
      {
        name: "fwdMsgFee",
        label: "Forward Message Fee",
        type: "number",
        EndAdornment: EndAdornment as FormikInputEndAdorment<IForm>,
      },
    ],
  };
};

export function SetFwdMsgFee() {
  const form = useForm();
  const daoAddress = useDaoAddressFromQueryParam();
  const { data } = useGetDaoFwdMsgFee(daoAddress);

  const formik = useFormik<IForm>({
    enableReinitialize: true,
    initialValues: {
      fwdMsgFee: Number(data),
    },
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {},
  });

  return (
    <FormikInputsForm<IForm> form={form} formik={formik}></FormikInputsForm>
  );
}

export const EndAdornment = ({
  name,
  formik,
}: {
  name: string;
  formik: FormikProps<IForm>;
}) => {
  const value = formik.values[name as keyof IForm];
  const initialValue = formik.initialValues[name as keyof IForm];

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
