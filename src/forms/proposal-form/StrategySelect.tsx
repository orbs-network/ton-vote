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
import { STRATEGIES } from "config";
import { FormikProps } from "formik";
import { useDaoAddressFromQueryParam } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/getters";
import { useMemo, useRef } from "react";
import { BsFillTrash3Fill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import {
  VotingPowerStrategy,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { ProposalForm } from "types";
import { handleDefaults } from "./utils";


const getValue = (
  selectedStrategies: VotingPowerStrategy[],
  type: string,
  name: string
) => {
  const strategy = _.find(
    selectedStrategies,
    (it) => it.type == (type as any as VotingPowerStrategyType)
  );

  if (!strategy) {
    return "";
  }

  return _.find(strategy.arguments, (it) => it.name === name)?.value;
};

const useStrategies = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  const { data, dataUpdatedAt } = useDaoQuery(daoAddress);

  return useMemo(() => {
    return _.mapValues(STRATEGIES, (strategy) => {
      return {
        ...strategy,
        args: _.map(strategy.args, (it) => handleDefaults(it, data)),
      };
    });
  }, [dataUpdatedAt]);
};



interface Props<T> {
  selectedStrategies: VotingPowerStrategy[];
  label: string;
  formik: FormikProps<T>;
  required?: boolean;
  tooltip?: string;
  name: string;
}

export function StrategySelect(props: Props<ProposalForm>) {
  const {
    selectedStrategies = [],
    label,
    formik,
    required,
    tooltip,
    name,
  } = props;
  const strategies = useStrategies();
  

  const selectedStrategiesTypes = _.map(selectedStrategies, (it) => {
    return it.type.toString();
  });

  const onSelect = (event: SelectChangeEvent<string[]>) => {
    const newStrategyTypes = [
      event.target.value[event.target.value.length - 1],
    ] as string[];
    const currentStrategiesType = _.map(
      formik.values.votingPowerStrategies,
      (it) => it.type as any as string
    );

    let updatedStrategies = _.filter(
      formik.values.votingPowerStrategies,
      (it) => newStrategyTypes.includes(it.type as any as string)
    );

    const diff = _.filter(
      _.difference(newStrategyTypes, currentStrategiesType),
      (it) => newStrategyTypes.includes(it)
    );

    _.forEach(_.compact(diff), (type) => {
      updatedStrategies.push({
        type: type as any as VotingPowerStrategyType,
        arguments: [],
      });
    });
    formik.setFieldValue(name, updatedStrategies);
  };

  const onInputChange = (type: string, inputName: string, value: any) => {
    const data = formik.values.votingPowerStrategies;

    const updated = _.map(data, (strategy) => {
      if ((strategy.type as any as string) != type) {        
        return strategy;
      }
      const argument = _.find(
        strategy?.arguments,
        (it) => it.name === inputName
      );
      
      if (argument) {
        argument.value = value;
        const index = strategy.arguments.findIndex((it) => it.name);
        return {
          type: strategy.type,
          arguments: strategy.arguments.splice(index, 1, argument),
        };
      }
      return {
        type: strategy.type,
        arguments: [...strategy.arguments, { name: inputName, value }],
      };
    });    

    formik.setFieldValue(name, updated);
  };

  return (
    <StyledContainer>
      <InputHeader title={label} required={required} tooltip={tooltip} />
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <FormControl fullWidth={true} sx={{ maxWidth: 600 }}>
          <Select
            // multiple={true}
            value={selectedStrategiesTypes}
            onChange={onSelect}
            renderValue={(selected: string[]) => {
              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const label =
                      strategies[value as any as VotingPowerStrategyType].name;
                    // return <Chip key={value} label={label} />;
                     return (
                       <Typography key={value}>
                         {label}
                       </Typography>
                     );
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
            {_.map(strategies, (value, key) => {
              const selected = selectedStrategiesTypes.includes(key);
              return (
                <StyledMenuItem key={key} value={key} bg={selected ? 1 : 0}>
                  <StyledFlexRow justifyContent="space-between" gap={30}>
                    <Typography>{value.name}</Typography>
                    {/* {selected && (
                      <BsFillTrash3Fill
                        style={{
                          width: 17,
                          height: 17,
                        }}
                      />
                    )} */}
                  </StyledFlexRow>
                </StyledMenuItem>
              );
            })}
          </Select>
        </FormControl>
        <>
          {_.map(strategies, (it, type) => {
            if (!selectedStrategiesTypes.includes(type)) {
              return null;
            }

            return it.args?.map((input) => {
              const value = getValue(selectedStrategies, type, input.name!);
              const errors: any = formik.errors
              return (
                <div
                  key={input.name}
                  style={{ maxWidth: "600px", width: "100%" }}
                >
                  <MapInput<ProposalForm>
                    formik={formik}
                    args={input}
                    value={value}
                    error={errors[input.name!]}
                    clearError={() => formik.setFieldError(input.name as string, undefined)}
                    onChange={(_value) => {
                      onInputChange(type, input.name!, _value);
                    }}
                  />
                </div>
              );
            });
          })}
        </>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const StyledContainer = styled(StyledSelectBoxInput)({
  ".MuiSelect-select": {
    padding: "13.4px 15px",
  },
});

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
