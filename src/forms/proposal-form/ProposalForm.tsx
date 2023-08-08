import { Box, Fade, styled } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { AppTooltip, Button, ConnectButton, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import { useDebouncedCallback } from "hooks/hooks";
import _ from "lodash";
import { mock } from "mock/mock";
import { useDaoStateQuery } from "query/getters";
import { useEffect, useMemo, useState } from "react";
import { StyledFlexRow } from "styles";
import { errorToast } from "toasts";
import {
  Dao,
  ProposalForm as ProposalFormType,
  ProposalHidePopupVariant,
  ProposalInputArgs,
  ProposalStatus,
} from "types";
import { validateFormik } from "utils";
import { useCreateProposalForm } from "./inputs";
import ProposalHidePopup from "./ProposalHidePopup";
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
  status,
}: {
  onSubmit: (values: ProposalFormType) => void;
  isLoading: boolean;
  initialFormData: ProposalFormType;
  persistForm?: (values: ProposalFormType) => void;
  dao: Dao;
  editMode?: boolean;
  submitText: string;
  status?: ProposalStatus;
}) {
  const form = useCreateProposalForm(initialFormData, editMode, status);
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
  const [variant, setVariant] = useState<ProposalHidePopupVariant>();
  const saveForm = useDebouncedCallback(() => {
    persistForm?.(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  const onSubmitClick = async () => {
    const hide = formik.values.hide;
    const prevHide = initialFormData.hide;

    const errors = await formik.validateForm(formik.values);
    if (!_.isEmpty(errors)) {
      validateFormik(formik);
      return;
    }

    if (mock.isMockDao(dao.daoAddress)) {
      errorToast("This is a mock DAO. You cannot create/edit proposals.");
      return;
    }

    if (!editMode && hide) {
      setVariant("hide");
    } else if (editMode && hide && !prevHide) {
      setVariant("changed-to-hide");
    } else if (editMode && !hide && prevHide) {
      setVariant("changed-to-show");
    } else {
      formik.submitForm();
    }
  };

  const onPopupSubmit = () => {
    setVariant(undefined);
    formik.submitForm();
  };

  
  const disableButton = !editMode
    ? false
    : _.isEqual(formik.values, formik.initialValues);

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
            disabled={disableButton}
          />
        </FormikInputsForm>
        <ProposalHidePopup
          variant={variant}
          onClose={() => setVariant(undefined)}
          open={!!variant}
          onSubmit={onPopupSubmit}
        />
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
  disabled
}: {
  onSubmit?: () => void;
  isLoading: boolean;
  submitText: string;
  disabled?: boolean;
}) {
  const address = useTonAddress();
  return (
    <AppTooltip text={disabled ? 'You need to change at least 1 input to proceed.' : ''}>
      <StyledSubmit>
        {!address ? (
          <StyledConnect />
        ) : (
          <StyledButton
            disabled={disabled}
            isLoading={isLoading}
            onClick={onSubmit}
          >
            {submitText}
          </StyledButton>
        )}
      </StyledSubmit>
    </AppTooltip>
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
