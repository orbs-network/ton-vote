import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { InputHeader } from "components";
import { FormikProps } from "formik";
import _ from "lodash";
import { StyledFlexColumn, StyledSelectContainer } from "styles";
import { InputInterface } from "types";

interface NestedSelectInputProps<T> {
  value?: string | number;
  label: string;
  inputs: InputInterface[];
  formik: FormikProps<T>;
  onChange: (value: string | number) => void;
  required?: boolean;
  tooltip?: string;
  options: { [key: string]: NestedSelectOption };
}

export interface NestedSelectOption {
  name: string;
  args: InputInterface[];
}

export function NestedSelectInput<T>(props: NestedSelectInputProps<T>) {
  const { value, options, label, formik, onChange, required, tooltip } = props;

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <StyledSelectContainer>
      <InputHeader title={label} required={required} tooltip={tooltip} />
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={value?.toString() || ""}
          onChange={handleChange}
        >
          {_.map(options, (value, key) => {
            return (
              <MenuItem key={key} value={key}>
                {value.name}
              </MenuItem>
            );
          })}
        </Select>

        {/* {options.map((it) => {
          if (!it.input || it.value !== value) return null;
          return (
            <div key={it.value} style={{ maxWidth: "600px", width: "100%" }}>
              <MapInput input={it.input} formik={formik} />{" "}
            </div>
          );
        })} */}
      </StyledFlexColumn>
    </StyledSelectContainer>
  );
}
