import styled from "@emotion/styled";
import {
  FormikInputsForm,
  TitleContainer,
  Button,
  OverflowWithTooltip,
} from "components";
import { useFormik } from "formik";
import _ from "lodash";
import { useAirdropStore } from "store";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { validateFormik } from "utils";
import { useAirdropVotersQuery, useAmount, useSetupAirdrop } from "../hooks";
import { CSSProperties } from "react";
import { AirdropForm } from "../types";
import SelectPopup from "components/SelectPopup";
import { useForm, useFormSchema } from "./form";
import { SubmitButtonContainer } from "../SubmitButton";
export const SetupAirdrop = () => {
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
  }


  return (
    <TitleContainer title="Setup airdrop">
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
  index: number;
  style: CSSProperties;
  data: {
    list: any;
    selected: string[];
    onSelect: (address: string) => void;
  };
}

function ManualVotersRow(props: ManualVotersRowProps) {
  const voter = props.data.list ? props.data.list[props.index] : undefined;

  return (
    <div style={props.style}>
      <SelectPopup.Row
        selected={props.data.selected.includes(voter) ? 1 : 0}
        onClick={() => props.data.onSelect(voter)}
      >
        <OverflowWithTooltip text={voter} />
      </SelectPopup.Row>
    </div>
  );
}

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
    <TitleContainer
      title="Manual voters select"
      headerComponent={
        <SelectPopup<string>
          Row={ManualVotersRow}
          selectButtonText="Select voters"
          title="Select voters"
          data={data}
          selected={selected}
          onSave={onSelect}
          itemSize={50}
        />
      }
    >
      <SelectPopup.List
        emptyText="No voters selected"
        isEmpty={!_.size(selected)}
      >
        {selected?.map((address) => {
          return (
            <SelectPopup.SelectedChip
              onDelete={() => onDelete(address)}
              key={address}
            >
              <OverflowWithTooltip text={address} className="title" />
            </SelectPopup.SelectedChip>
          );
        })}
      </SelectPopup.List>
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
