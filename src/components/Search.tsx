import { styled, useTheme } from "@mui/material";
import { useDebounce } from "hooks";
import { useEffect, useState } from "react";
import { StyledFlexRow } from "styles";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { Container } from "./Container";
import { Select } from "./Select";
import { SelectOption } from "types";
import _ from "lodash";

export function Search({
  className = "",
  onChange,
  initialValue = "",
  filterOptions,
  filterValue,
  onFilterSelect,
  placeholder = "Search",
}: {
  className?: string;
  onChange: (value: string) => void;
  initialValue?: string;
  filterOptions?: SelectOption[];
  filterValue?: string;
  onFilterSelect?: (value: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce<string>(value, 300);

  const showFilter = filterOptions && filterValue && onFilterSelect;

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <StyledContainer className={className} hover={true}>
      <StyledFlexRow style={{ height: "100%", paddingLeft: 10, gap: 0 }}>
        <StyledLeft>
          <HiMagnifyingGlass />
          <StyledInput
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </StyledLeft>
        {showFilter && (
          <StyledSelect
            options={filterOptions}
            selected={filterValue}
            onSelect={onFilterSelect}
          />
        )}
      </StyledFlexRow>
    </StyledContainer>
  );
}

const StyledSelect = styled(Select)({
  "*": {
    border: "unset!imporatnt",
    outline: "unset!imporatnt",
  },
  ".MuiSelect-select": {
    minWidth: 'unset',
    border: "unset",
    paddingLeft: 12,
    "&:hover": {
      border: "unset",
    },
  },
  fieldset: {
    display: "none!important",
  },
});

const StyledLeft = styled(StyledFlexRow)({
  flex: 1,
  height: "100%",
  borderRight: "1px solid rgba(211, 211, 211, 0.5)",
});

const StyledContainer = styled(Container)({
  height: 46,
  padding: 0,
  overflow: "hidden",
  borderRadius: 30,
  svg: {
    width: 25,
    height: 25,
  },
});

const StyledInput = styled("input")({
  height: "100%",
  border: "unset",
  outline: "unset",
  width: "calc(100% - 25px)",
  minWidth: "unset",
  fontSize: 16,
  fontFamily:'inherit',
  fontWeight: 500,
  "&::placeholder": {
    opacity: 0.5,
  },
});
