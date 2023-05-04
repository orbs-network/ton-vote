import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { InputHeader, MapInput } from "components";
import { StyledSelectBoxInput } from "components/inputs/styles";
import { FormikProps } from "formik";
import _ from "lodash";
import { useMemo } from "react";
import { StyledFlexColumn } from "styles";
import { parseStrategyJSON, STRATEGY_DATA, STRATEGY_TYPE } from "./store";
import { STRATEGIES } from "./strategies";
import { CreateProposalForm } from "./types";

interface Props<T> {
  value?: string;
  label: string;
  formik: FormikProps<T>;
  required?: boolean;
  tooltip?: string;
  name: string;
}

export function StrategySelect(props: Props<CreateProposalForm>) {
  const { value, label, formik, required, tooltip, name } = props;
  const parsedValue = useMemo(() => parseStrategyJSON(value), [value]);

  const selectedOption = useMemo(
    () => _.find(STRATEGIES, (it, key) => key === parsedValue.type),
    [value]
  );

  const onSelect = (event: SelectChangeEvent) => {
    const newValue = {
      [STRATEGY_TYPE]: event.target.value,
      [STRATEGY_DATA]: {},
    };
    formik.setFieldValue(name, JSON.stringify(newValue));
  };

  const onInputChange = (_name: string, value: any) => {
    const data = parsedValue.data;
    const newValue = {
      ...parsedValue,
      [STRATEGY_DATA]: { ...data, [_name]: value },
    };
    
    formik.setFieldValue(name, JSON.stringify(newValue));
  };

  return (
    <StyledSelectBoxInput>
      <InputHeader title={label} required={required} tooltip={tooltip} />
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <Select
          value={parsedValue.type?.toString() || ""}
          onChange={onSelect}
          MenuProps={{
            PaperProps: {
              style: {
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
              },
            },
          }}
        >
          {_.map(STRATEGIES, (value, key) => {
            return (
              <MenuItem key={key} value={key}>
                {value.name}
              </MenuItem>
            );
          })}
        </Select>
        {selectedOption?.args?.map((it) => {
          return (
            <div key={it.name} style={{ maxWidth: "600px", width: "100%" }}>
              <MapInput<CreateProposalForm>
                args={it}
                value={parsedValue.data[it.name]}
                error=""
                onChange={(value) => onInputChange(it.name, value)}
              />
            </div>
          );
        })}
      </StyledFlexColumn>
    </StyledSelectBoxInput>
  );
}
