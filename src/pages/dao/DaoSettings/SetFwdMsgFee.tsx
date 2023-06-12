import { Typography } from "@mui/material";
import { Button, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import _ from "lodash";
import { useAppParams } from "hooks/hooks";

import { FormArgs, FormikInputEndAdorment } from "types";
import { StyledEndAdornment } from "styles";
import { useDaoQuery, useDaoStateQuery } from "query/getters";
import { useSetDaoFwdMsgFee } from "query/setters";

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
  const { daoAddress } = useAppParams();
  const { data: daoState } = useDaoStateQuery(daoAddress);

  const formik = useFormik<IForm>({
    enableReinitialize: true,
    initialValues: {
      fwdMsgFee: Number(daoState?.fwdMsgFee),
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
  const { daoAddress } = useAppParams();

  const value = formik.values[name as keyof IForm];
  const initialValue = formik.initialValues[name as keyof IForm];
  const data = useDaoQuery(daoAddress).data;
  const { mutate: setCreateProposalFee, isLoading } = useSetDaoFwdMsgFee();

  const { refetch } = useDaoStateQuery(data?.daoAddress);

  const onSubmit = () => {
    if (name === "fwdMsgFee") {
      return setCreateProposalFee({
        daoIds: [data!.daoId!],
        amount: value,
        onError: (error: string) => formik.setFieldError(name, error),
        onSuccess: refetch,
      });
    }
  };

  if (!_.isNumber(value) || initialValue === value) return null;

  return (
    <StyledEndAdornment>
      <Button onClick={onSubmit} isLoading={isLoading}>
        <Typography>Update</Typography>
      </Button>
    </StyledEndAdornment>
  );
};
