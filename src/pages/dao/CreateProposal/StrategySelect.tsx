import {
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  Typography,
} from "@mui/material";
import { InputHeader, MapInput } from "components";
import { StyledSelectBoxInput } from "components/inputs/styles";
import { FormikProps } from "formik";
import _ from "lodash";
import { useMemo, useRef } from "react";
import { BsFillTrash3Fill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { parseStrategyJSON } from "./store";
import { STRATEGIES } from "./strategies";
import { CreateProposalForm, StrategyValue } from "./types";

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

  const selectedOptions = useMemo(
    () => _.filter(STRATEGIES, (it, key) => parsedValue.type.includes(key)),
    [value]
  );

  const onSelect = (event: SelectChangeEvent<string[]>) => {
    const newValue: StrategyValue = {
      args: [[]],
      type: event.target.value as string[],
    };
    formik.setFieldValue(name, JSON.stringify(newValue));
  };

  const onInputChange = (
    strategyIndex: number,
    argIndex: number,
    value: any
  ) => {
    const args = parsedValue.args;
    args[strategyIndex] = args[strategyIndex] || [];
    args[strategyIndex][argIndex] = value;
    const newValue: StrategyValue = {
      ...parsedValue,
      args,
    };

    formik.setFieldValue(name, JSON.stringify(newValue));
  };

  return (
    <StyledSelectBoxInput>
      <InputHeader title={label} required={required} tooltip={tooltip} />
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <FormControl fullWidth={true} sx={{ maxWidth: 600 }}>
          <Select
            multiple={true}
            value={parsedValue.type}
            onChange={onSelect}
            renderValue={(selected: string[]) => {
              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const label = STRATEGIES[value].name;
                    return <Chip key={value} label={label} />;
                  })}
                </Box>
              );
            }}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "center",
              },
              PaperProps: {
                style: {
                  width: "fit-content",
                  borderRadius: 10,
                  border: "1px solid #e0e0e0",
                  boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
                },
              },
            }}
          >
            {_.map(STRATEGIES, (value, key) => {
              const selected = parsedValue.type.includes(key);
              return (
                <StyledMenuItem key={key} value={key} bg={selected ? 1 : 0}>
                  <StyledFlexRow justifyContent="space-between" gap={30}>
                    <Typography>{value.name}</Typography>
                    {selected && (
                      <BsFillTrash3Fill
                        style={{
                          width: 17,
                          height: 17,
                        }}
                      />
                    )}
                  </StyledFlexRow>
                </StyledMenuItem>
              );
            })}
          </Select>
        </FormControl>
        <>
          {selectedOptions?.map((strategy, strategyIndex) => {
            return (
              <div key={strategyIndex} style={{ width: "100%" }}>
                {strategy.args?.map((it, argIndex) => {
                  let value;
                  try {
                    value = parsedValue.args[strategyIndex][argIndex];
                  } catch (error) {}
                  return (
                    <div
                      key={argIndex}
                      style={{ maxWidth: "600px", width: "100%" }}
                    >
                      <MapInput<CreateProposalForm>
                        args={it}
                        value={value}
                        error=""
                        onChange={(value) =>
                          onInputChange(strategyIndex, argIndex, value)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      </StyledFlexColumn>
    </StyledSelectBoxInput>
  );
}

const StyledMenuItem = styled(MenuItem)<{ bg: number }>(({ bg }) => ({
  paddingTop: 10,
  paddingBottom: 10,
  marginBottom: 10,
  borderRadius: 10,
  marginLeft: 10,
  marginRight: 10,
  background: bg
    ? "rgba(0, 136, 204, 0.08)!important"
    : "transparent!important",
  ".MuiTouchRipple-root": {
    display: "none",
  },
  ":last-child": {
    marginBottom: 0,
  },
  "&:hover": {
    background: !bg && "rgba(0, 136, 204, 0.04)!important",
  },
}));
