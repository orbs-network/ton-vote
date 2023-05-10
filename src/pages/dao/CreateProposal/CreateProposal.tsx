import { Box, Fade, styled } from "@mui/material";
import {
  Button,
  ConnectButton,
  FormikInputsForm,
  LoadingContainer,
  Page,
} from "components";
import { FormikProps, useFormik } from "formik";
import { useDaoAddressFromQueryParam, useDebouncedCallback } from "hooks";
import { StyledFlexRow } from "styles";
import { useCreateProposal, useCreateProposalStore } from "./store";
import { useConnection } from "ConnectionProvider";
import _ from "lodash";
import { useEffect } from "react";
import { useDaoFromQueryParam, useDaoQuery } from "query/queries";
import { validateFormik } from "utils";
import { CreateProposalForm, CreateProposalInputArgs } from "./types";
import { appNavigation } from "router/navigation";
import { InputArgs } from "types";
import { StrategySelect } from "./StrategySelect";
import { useFormInitialValues } from "./hooks";
import { useCreateProposalForm } from "./form/inputs";
import { useFormSchema } from "./form/validation";

function Form() {
  const daoAddress = useDaoAddressFromQueryParam();

  const { mutate: createProposal, isLoading } = useCreateProposal();
  const data = useDaoFromQueryParam().data;
  const { formData, setFormData } = useCreateProposalStore();
  const form = useCreateProposalForm(formData);

  const initialValues = useFormInitialValues(formData, data);
  const FormSchema = useFormSchema();

  const formik = useFormik<CreateProposalForm>({
    initialValues,
    validationSchema: FormSchema,
    onSubmit: (formValues) =>
      createProposal({ formValues, daoAddr: daoAddress }),
    validateOnChange: false,
    validateOnBlur: true,
  });
  const customInputHandler = useCustomInputHandler(formik);

  const saveForm = useDebouncedCallback(() => {
    setFormData(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  return (
    <Fade in={true}>
      <StyledContainer alignItems="flex-start">
        <FormikInputsForm<CreateProposalForm>
          formik={formik}
          form={form}
          customInputHandler={customInputHandler}
        >
          <CreateProposalButton
            isLoading={isLoading}
            onSubmit={() => {
              formik.submitForm();
              validateFormik(formik);
            }}
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

const useCustomInputHandler = (formik: FormikProps<CreateProposalForm>) => {
  return (args: CreateProposalInputArgs) => {
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

export const CreateProposal = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  const isLoading = useDaoQuery(daoAddress).isLoading;

  return (
    <StyledPage back={appNavigation.daoPage.root(daoAddress)}>
      {isLoading ? <LoadingContainer loaderAmount={5} /> : <Form />}
    </StyledPage>
  );
};

const StyledPage = styled(Page)({
  maxWidth: 900,
});

function CreateProposalButton({
  onSubmit,
  isLoading,
}: {
  onSubmit?: () => void;
  isLoading: boolean;
}) {
  const address = useConnection().address;
  return (
    <StyledSubmit>
      {!address ? (
        <StyledConnect />
      ) : (
        <StyledButton isLoading={isLoading} onClick={onSubmit}>
          Create
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
