import styled from "@emotion/styled";
import {
  FormikInputsForm,
  Button,
  OverflowWithTooltip,
  SelectedChip,
  AppTooltip,
  VirtualList,
  VirtualListRowProps,
} from "components";
import _ from "lodash";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { getTonScanContractUrl } from "utils";
import { useAirdropVotersQuery } from "../../hooks";
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
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";

export const SelectMethod = ({
  formik,
}: {
  formik: FormikProps<AirdropForm>;
}) => {
  const form = useForm(formik.values);
  const { proposals } = useAirdropStore();
  const t = useAirdropTranslations();

  const disabled = _.isEmpty(proposals);

  return (
      <StyledContainer
        disabled={disabled ? 1 : 0}
        placement="bottom"
        text={disabled ? t.proposalsNotSelected : undefined}
      >
        <StyledListTitleContainer title="Select voters">
          <StyledForm>
            <FormikInputsForm<AirdropForm>
              form={form}
              formik={formik}
              customInputHandler={customInputHandler}
            ></FormikInputsForm>
          </StyledForm>
        </StyledListTitleContainer>
      </StyledContainer>
  );
};

const StyledContainer = styled(AppTooltip)<{ disabled: number }>(
  ({ disabled }) => ({
    opacity: disabled ? 0.6 : 1,
    width: "100%",
    "*": {
      pointerEvents: disabled ? "none" : "all",
    },
  })
);

const customInputHandler = () => {
  return <ManualVotersSelect />;
};

function ManualVotersRow(props: VirtualListRowProps) {
  const value = props.data.list[props.index];
  const { data: voters, dataUpdatedAt } = useAirdropVotersQuery();
  const voter = useMemo(
    () => voters?.find((voter) => voter === value),
    [dataUpdatedAt]
  );

  const onClick = () => {
    window.open(getTonScanContractUrl(voter), "_blank");
  };

  return (
    <VirtualList.RowContent
      onClick={() => props.data.onSelect!(value)}
      isSelected={props.data.selected.includes(value)}
    >
      <StyledVoter>
        <OverflowWithTooltip
          className="address"
          text={voter}
          placement="right"
        />
        <RowLink text="View voter" onClick={onClick} />
      </StyledVoter>
    </VirtualList.RowContent>
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
  const [showMore, setShowMore] = useState(false);
  const disabled = _.isEmpty(proposals);

  const t = useAirdropTranslations();
  return (
    <StyledListTitleContainer
      title="Select manually"
      headerComponent={
        !disabled && (
          <Button variant="text" onClick={() => setOpen(true)}>
            Select
          </Button>
        )
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
