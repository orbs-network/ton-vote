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
import { useCreateProposalStore } from "./store";
import _ from "lodash";
import { useEffect } from "react";
import { validateFormik } from "utils";
import { CreateProposalForm, CreateProposalInputArgs } from "./types";
import { appNavigation, useAppNavigation } from "router/navigation";
import { StrategySelect } from "./StrategySelect";
import { getInitialValues } from "./utils";
import { useCreateProposalForm } from "./form/inputs";
import { useFormSchema } from "./form/validation";
import { useDaoFromQueryParam, useDaoStateQuery } from "query/getters";
import { prepareMetadata } from "./utils";
import { useCreateProposalQuery } from "query/setters";
import { useNewDataStore } from "store";
import { useTonAddress } from "@tonconnect/ui-react";
import { mock } from "mock/mock";
import { errorToast } from "toasts";

function Form() {
  const daoAddress = useDaoAddressFromQueryParam();

  const { mutate: createProposal, isLoading } = useCreateProposalQuery();
  const data = useDaoFromQueryParam().data;
  const { formData, setFormData } = useCreateProposalStore();
  const form = useCreateProposalForm(formData);
  const daoState = useDaoStateQuery(daoAddress).data;
  const appNavigation = useAppNavigation();
  const FormSchema = useFormSchema();
  const { addProposal } = useNewDataStore();

  const formik = useFormik<CreateProposalForm>({
    initialValues: getInitialValues(formData, data),
    validationSchema: FormSchema,
    onSubmit: (formValues) => {
      const metadata = prepareMetadata(formValues);
      
      createProposal({
        metadata,
        onSuccess: (proposalAddress: string) => {
          appNavigation.proposalPage.root(daoAddress, proposalAddress);
          setFormData({} as CreateProposalForm);
          addProposal(daoAddress, proposalAddress);
        },
      });
    },
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

  const onSubmit = () => {
    if (mock.isMockDao(daoAddress)) {
      errorToast("You can't create proposals on mock DAOs");
    } else {
      formik.submitForm();
      validateFormik(formik);
    }
  };

  return (
    <Fade in={true}>
      <StyledContainer alignItems="flex-start">
        <FormikInputsForm<CreateProposalForm>
          formik={formik}
          form={form}
          customInputHandler={customInputHandler}
        >
          <CreateProposalButton
            isLoading={isLoading || daoState?.fwdMsgFee === undefined}
            onSubmit={onSubmit}
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
  const isLoading = useDaoFromQueryParam().isLoading;

  return (
    <StyledPage back={appNavigation.daoPage.root(daoAddress)}>
      {isLoading ? <LoadingContainer loaderAmount={5} /> : <Form />}
    </StyledPage>
  );
};

const StyledPage = styled(Page)({
  maxWidth: 800,
});

function CreateProposalButton({
  onSubmit,
  isLoading,
}: {
  onSubmit?: () => void;
  isLoading: boolean;
}) {
  const address = useTonAddress();
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
