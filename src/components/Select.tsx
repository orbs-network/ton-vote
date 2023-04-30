import {
  Box,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  styled,
} from "@mui/material";
import { SelectOption } from "types";
import {MdKeyboardArrowDown} from 'react-icons/md'
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
    <StyledContainer className={className}>
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
    </StyledContainer>
  );
}


const StyledContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  ".MuiInputBase-root": {
    borderRadius: 30,
  },
  ".MuiOutlinedInput-notchedOutline": {
    display: "none",
  },
  ".MuiSelect-select": {
    minWidth: 200,
    padding: "8px 15px 8px 15px",
    border: `1px solid rgba(211, 211, 211, 0.5)`,
    borderRadius: `30px!important`,
    transition: "0.2s all",
    "&:hover": {
      border: `1px solid ${theme.palette.primary.main}`,
    },
  },
  ".MuiSelect-icon": {
    width: 20,
    height: 20,
    marginTop: -2,
  },
}));
