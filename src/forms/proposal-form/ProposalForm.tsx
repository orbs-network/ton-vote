import { Box, Fade, styled } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { Button, ConnectButton, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import { useDebouncedCallback } from "hooks";
import { mock } from "mock/mock";
import {  useDaoStateQuery } from "query/getters";
import { useEffect } from "react";
import { StyledFlexRow } from "styles";
import { errorToast } from "toasts";
import { Dao, ProposalForm as ProposalFormType, ProposalInputArgs } from "types";
import { validateFormik } from "utils";
import { useCreateProposalForm } from "./inputs";
import { StrategySelect } from "./StrategySelect";
import { getInitialValues } from "./utils";
import { useFormSchema } from "./validation";

export function ProposalForm({
  onSubmit,
  isLoading,
  initialFormData,
  persistForm,
  dao,
  editMode = false,
  submitText,
}: {
  onSubmit: (values: ProposalFormType) => void;
  isLoading: boolean;
  initialFormData: ProposalFormType;
  persistForm?: (values: ProposalFormType) => void;
  dao: Dao;
  editMode?: boolean;
  submitText: string;
}) {
  const form = useCreateProposalForm(initialFormData);
  const daoState = useDaoStateQuery(dao.daoAddress).data;
  const FormSchema = useFormSchema();

  const formik = useFormik<ProposalFormType>({
    initialValues: getInitialValues(initialFormData, dao, editMode),
    validationSchema: FormSchema,
    onSubmit,
    validateOnChange: false,
    validateOnBlur: true,
  });
  const customInputHandler = useCustomInputHandler(formik);

  const saveForm = useDebouncedCallback(() => {
    persistForm?.(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  const onSubmitClick = () => {
    if (mock.isMockDao(dao.daoAddress)) {
      errorToast("This is a mock DAO. You cannot create/edit proposals.");
    } else {
      formik.submitForm();
      validateFormik(formik);
    }
  };

  return (
    <Fade in={true}>
      <StyledContainer alignItems="flex-start">
        <FormikInputsForm<ProposalFormType>
          formik={formik}
          form={form}
          customInputHandler={customInputHandler}
        >
          <CreateProposalButton
            submitText={submitText}
            isLoading={isLoading || daoState?.fwdMsgFee === undefined}
            onSubmit={onSubmitClick}
          />
        </FormikInputsForm>
      </StyledContainer>
    </Fade>
  );
}

const StyledContainer = styled(StyledFlexRow)({
  flex: 1,
  ".date-input": {
    ".MuiFormControl-root": {
      width: "100%",
    },
  },
});

function CreateProposalButton({
  onSubmit,
  isLoading,
  submitText,
}: {
  onSubmit?: () => void;
  isLoading: boolean;
  submitText: string;
}) {
  const address = useTonAddress();
  return (
    <StyledSubmit>
      {!address ? (
        <StyledConnect />
      ) : (
        <StyledButton isLoading={isLoading} onClick={onSubmit}>
          {submitText}
        </StyledButton>
      )}
    </StyledSubmit>
  );
}

const StyledSubmit = styled(Box)({
  width: "100%",
  maxWidth: 400,
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 80,
});

const StyledConnect = styled(ConnectButton)({
  width: "100%",
});

const StyledButton = styled(Button)({
  width: "100%",
});


const useCustomInputHandler = (formik: FormikProps<ProposalFormType>) => {
  return (args: ProposalInputArgs) => {
    const value = formik.values.votingPowerStrategies;
    return (
      <StrategySelect
        required={args.required}
        tooltip={args.tooltip}
        selectedStrategies={value || []}
        label={args.label}
        formik={formik}
        name={args.name!}
      />
    );
  };
};
