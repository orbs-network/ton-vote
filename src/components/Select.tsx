import {
  Box,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  styled,
} from "@mui/material";
import { SelectOption } from "types";
import {MdKeyboardArrowDown} from 'react-icons/md'
import { StyledSelectContainer } from "styles";
interface Props {
  options: SelectOption[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function Select({ options, selected, onSelect, className = '' }: Props) {
  const handleChange = (event: SelectChangeEvent) => {
    onSelect(event.target.value);
  };

  return (
    <StyledSelectContainer className={className}>
      <MuiSelect
        MenuProps={{
          PaperProps: {
            style: {
              borderRadius: 10,
              border: "1px solid #e0e0e0",
              boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
            },
          },
        }}
        IconComponent={MdKeyboardArrowDown}
        value={selected}
        onChange={handleChange}
      >
        {options.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.text}
            </MenuItem>
          );
        })}
      </MuiSelect>
    </StyledSelectContainer>
  );
}



