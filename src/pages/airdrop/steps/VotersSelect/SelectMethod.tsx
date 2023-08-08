import styled from "@emotion/styled";
import {
  FormikInputsForm,
  Button,
  OverflowWithTooltip,
  SelectedChip,
  AppTooltip,
} from "components";
import _ from "lodash";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { getTonScanContractUrl } from "utils";
import {
  useAirdropVotersQuery,
} from "../../hooks";
import { useMemo, useState } from "react";
import { useForm } from "./form";
import { AirdropForm, useAirdropStore } from "../../store";
import {
  StyledAirdropList,
  StyledListTitleContainer,
  StyledSelectedList,
  StyledSelectPopup,
} from "pages/airdrop/styles";
import { Typography } from "@mui/material";
import { RowLink } from "pages/airdrop/Components";
import { FormikProps } from "formik";

export const SelectMethod = ({ formik }: { formik: FormikProps<AirdropForm> }) => {

  const form = useForm(formik.values);

  return (
    <StyledListTitleContainer title="Select voters">
      <StyledForm>
        <FormikInputsForm<AirdropForm>
          form={form}
          formik={formik}
          customInputHandler={customInputHandler}
        ></FormikInputsForm>
      </StyledForm>
    </StyledListTitleContainer>
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

  const onClick = () => {
    window.open(getTonScanContractUrl(voter), "_blank");
  };

  return (
    <StyledVoter>
      <OverflowWithTooltip className="address" text={voter} placement="right" />
      <RowLink text="View voter" onClick={onClick} />
    </StyledVoter>
  );
}

const StyledVoter = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  ".address": { fontSize: 13 },
});

const ManualVotersSelect = () => {
  const [open, setOpen] = useState(false);
  const { data } = useAirdropVotersQuery();
  const { manuallySelectedVoters, setManuallySelectedVoters, daos, proposals } =
    useAirdropStore();
    const [showMore, setShowMore] = useState(false)

  return (
    <StyledListTitleContainer
      title="Select manually"
      headerComponent={
        <AppTooltip
          text={
            _.isEmpty(daos)
              ? "Select a DAO space"
              : _.isEmpty(proposals)
              ? "Select proposal"
              : ""
          }
        >
          <Button
            disabled={_.isEmpty(proposals)}
            variant="text"
            onClick={() => setOpen(true)}
          >
            Select
          </Button>
        </AppTooltip>
      }
    >
      {_.isEmpty(manuallySelectedVoters) ? (
        <StyledFlexColumn className="not-selected">
          <Typography>Voters not selected</Typography>
        </StyledFlexColumn>
      ) : (
        <StyledSelectedList>
          {manuallySelectedVoters?.map((voter, index) => {
            if (!showMore && index > 5) return null;
            return (
              <StyledSelectedVoter
                key={voter}
                onDelete={() => setManuallySelectedVoters(voter)}
              >
                <OverflowWithTooltip text={voter} />
              </StyledSelectedVoter>
            );
          })}
          {_.size(manuallySelectedVoters) > 6 && (
            <StyledFlexRow className="show-all">
              <Button
                variant="transparent"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </Button>
            </StyledFlexRow>
          )}
        </StyledSelectedList>
      )}

      <StyledSelectPopup
        title="Select voters manually"
        open={open}
        onClose={() => setOpen(false)}
      >
        <>
          <StyledList
            selected={manuallySelectedVoters}
            onSelect={setManuallySelectedVoters}
            RowComponent={ManualVotersRow}
            data={data}
            itemSize={50}
          />
          <Button onClick={() => setOpen(false)}>Close</Button>
        </>
      </StyledSelectPopup>
    </StyledListTitleContainer>
  );
};

const StyledSelectedVoter = styled(SelectedChip)({
 
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: {
    fontSize: 12,
  },
});

const StyledList = styled(StyledAirdropList)({
  flex: 1,
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


