import styled from "@emotion/styled";
import {
  FormikInputsForm,
  TitleContainer,
  Button,
  OverflowWithTooltip,
  AddressDisplay,
} from "components";
import { useFormik } from "formik";
import _ from "lodash";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { validateFormik } from "utils";
import { useAirdropVotersQuery, useAmount, useSetupAirdrop } from "../../hooks";
import { CSSProperties, useMemo } from "react";
import { AirdropForm } from "../../types";
import { VirtualList } from "components";
import { useForm, useFormSchema } from "./form";
import { SubmitButtonContainer } from "../SubmitButton";
import { Typography } from "@mui/material";
import { useAirdropStore } from "../../store";
export const TypeSelect = () => {
  const { mutate, isLoading } = useSetupAirdrop();
  const { jettonAddress, type, voters, votersSelectionMethod } =
    useAirdropStore();

  const { amount } = useAmount();

  const schema = useFormSchema();

  const formik = useFormik<AirdropForm>({
    initialValues: {
      walletsAmount: _.size(voters) || undefined,
      assetAmount: amount || undefined,
      address: jettonAddress,
      type,
      votersSelectionMethod,
      manualVoters: voters || [],
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
    <TitleContainer title="Choose airdrop type">
      <Typography>Some text</Typography>
      <StyledForm>
        <FormikInputsForm<AirdropForm>
          form={form}
          formik={formik}
          customInputHandler={customInputHandler}
        >
          <StyledAction>
            <SubmitButtonContainer>
              <Button isLoading={isLoading} onClick={onSubmit}>
                Next
              </Button>
            </SubmitButtonContainer>
          </StyledAction>
        </FormikInputsForm>
      </StyledForm>
    </TitleContainer>
  );
};

const customInputHandler = (
  args: any,
  value: any,
  onChange: (value: any) => void
) => {
  return <ManualVotersSelect onSelect={onChange} selected={value || []} />;
};

interface ManualVotersRowProps {
  value: string;
}

function ManualVotersRow({ value }: ManualVotersRowProps) {
  const { data: voters, dataUpdatedAt } = useAirdropVotersQuery();
  const voter = useMemo(
    () => voters?.find((voter) => voter === value),
    [dataUpdatedAt]
  );

  return (
    <StyledVoter>
      <OverflowWithTooltip text={voter} />
    </StyledVoter>
  );
}

const StyledVoter = styled(StyledFlexRow)({});

const ManualVotersSelect = ({
  selected,
  onSelect,
}: {
  selected: string[];
  onSelect: (address: string[]) => void;
}) => {
  const { data } = useAirdropVotersQuery();

  const onDelete = (address: string) => {
    onSelect(_.filter(selected, (item) => item !== address));
  };

  return (
    <TitleContainer title="Manual voters select">
      <VirtualList RowComponent={ManualVotersRow} data={data} itemSize={60} />
    </TitleContainer>
  );
};

const StyledForm = styled(StyledFlexColumn)({
  ".select-box": {
    ".MuiInputBase-root": {
      width: "100%",
    },
    ".MuiSelect-select": {
      borderRadius: "10px!important",
      width: "100%",
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
