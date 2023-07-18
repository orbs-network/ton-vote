import styled from "@emotion/styled";
import { useTonAddress } from "@tonconnect/ui-react";
import {
  FormikInputsForm,
  TitleContainer,
  Button,
  ConnectButton,
} from "components";
import { useFormik } from "formik";
import _ from "lodash";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { validateFormik } from "utils";
import { AirdropForm, useForm, useFormSchema } from "./form";
import { useAirdrop, useCreateAirdrop } from "./hooks";

export const Form = () => {
  const { mutate, isLoading } = useCreateAirdrop();
  const { amount, jettonAddress, type, votersCount } = useAirdrop();

  const schema = useFormSchema();

  const formik = useFormik<AirdropForm>({
    initialValues: {
      walletsAmount: votersCount || undefined,
      assetAmount: amount || undefined,
      address: jettonAddress,
      type,
    },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values: AirdropForm) => mutate(values),
  });
  const form = useForm(formik.values);

  const onSubmit = () => {
    validateFormik(formik);
    formik.submitForm();
  };

  return (
    <TitleContainer title="Airdrop">
      <StyledForm>
        <FormikInputsForm<AirdropForm> form={form} formik={formik}>
          <StyledAction>
            <ActionButton isLoading={isLoading} onClick={onSubmit} />
          </StyledAction>
        </FormikInputsForm>
      </StyledForm>
    </TitleContainer>
  );
};

const ActionButton = ({
  isLoading,
  onClick,
}: {
  isLoading: boolean;
  onClick: () => void;
}) => {
  const address = useTonAddress();
  if (!address) {
    return <ConnectButton />;
  }
  return (
    <Button isLoading={isLoading} onClick={onClick}>
      Start
    </Button>
  );
};

const StyledForm = styled(StyledFlexColumn)({
  ".select-box": {
    ".MuiSelect-select": {
      borderRadius: '10px!important',
    },
  },
  ".formik-form": {
    border: "unset",
    padding: "unset",
    width: "100%",
    boxShadow: "unset",
    ".title-container-children": {
      padding: 0,
    },
  },
});

const StyledAction = styled(StyledFlexRow)({
  marginTop: 40,
  button: {
    minWidth: 200,
  },
});
