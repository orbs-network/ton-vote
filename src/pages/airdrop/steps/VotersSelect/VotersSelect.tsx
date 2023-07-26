import styled from "@emotion/styled";
import {
  FormikInputsForm,
  TitleContainer,
  Button,
  OverflowWithTooltip,
  AddressDisplay,
} from "components";
import _ from "lodash";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { validateFormik } from "utils";
import {
  useAirdropFormik,
  useAirdropVotersQuery,
  useVotersSelectSubmit,
} from "../../hooks";
import { useMemo } from "react";
import { useForm, useFormSchema } from "./form";
import { SubmitButtonContainer } from "../SubmitButton";
import { AirdropForm, useAirdropStore } from "../../store";
import { StyledAirdropList, StyledListTitleContainer, StyledVirtualListContainer } from "pages/airdrop/styles";

export const VotersSelect = () => {
  const { mutate } = useVotersSelectSubmit();

  const schema = useFormSchema();

  const formik = useAirdropFormik(mutate, schema);
  const form = useForm(formik.values);

  const onSubmit = () => {
    validateFormik(formik);
    formik.submitForm();
  };

  return (
    <TitleContainer title="Select voters" subtitle="Some text">
      <StyledForm>
        <FormikInputsForm<AirdropForm>
          form={form}
          formik={formik}
          customInputHandler={customInputHandler}
        >
          <SubmitButtonContainer>
            <Button onClick={onSubmit}>Next</Button>
          </SubmitButtonContainer>
        </FormikInputsForm>
      </StyledForm>
    </TitleContainer>
  );
};

const customInputHandler = () => {
  return <ManualVotersSelect />;
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

const StyledVoter = styled(StyledFlexRow)({
  justifyContent: "flex-start",
});

const ManualVotersSelect = () => {
  const { data } = useAirdropVotersQuery();
  const { manuallySelectedVoters, setManuallySelectedVoters } =
    useAirdropStore();

  return (
    <StyledListTitleContainer
      title={
        <>
          Select voters manually{" "}
          <small>{`(${_.size(manuallySelectedVoters)})`}</small>
        </>
      }
    >
      <StyledList
        selected={manuallySelectedVoters}
        onSelect={setManuallySelectedVoters}
        RowComponent={ManualVotersRow}
        data={data}
        itemSize={50}
      />
    </StyledListTitleContainer>
  );
};



const StyledList = styled(StyledAirdropList)({
  height: 300,
});

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
