import { styled, useTheme } from "@mui/material";
import { useDebounce } from "hooks";
import  { useEffect, useState } from "react";
import { StyledFlexRow, StyledHoverContainer } from "styles";
import { HiMagnifyingGlass } from "react-icons/hi2";

export function Search({
  className = "",
  onChange,
  initialValue = ""
}: {
  className?: string;
  onChange: (value: string) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce<string>(value, 300);
  const [focused, setFocused] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <StyledContainer
      className={className}
      style={{
        border: focused ? `1px solid ${theme.palette.primary.main}` : "",
      }}
    >
      <StyledContent>
        <HiMagnifyingGlass />
        <StyledInput
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </StyledContent>
    </StyledContainer>
  );
}

const StyledContent = styled(StyledFlexRow)({
  height: "100%",
  paddingLeft: 12,
});

const StyledContainer = styled(StyledHoverContainer)({
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
  flex: 1,
  fontSize: 16,
  "&::placeholder": {
    opacity: 0.5,
  },
});
