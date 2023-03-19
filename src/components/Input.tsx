import { TextField, styled, Typography } from "@mui/material";
import React from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { RiErrorWarningLine } from "react-icons/ri";
interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  onFocus?: () => void;
  type?: "text" | "password";
  multiline?: boolean;
  rows?: number;
  onBlur?: () => void;
  placeholder?: string
}

function Input({
  value,
  onChange,
  label,
  error,
  onFocus,
  type = "text",
  multiline,
  rows,
  onBlur,
  placeholder,
}: Props) {
  return (
    <StyledContainer>
      <StyledInput
        placeholder={placeholder}
        onBlur={onBlur}
        rows={rows}
        multiline={multiline}
        onFocus={onFocus}
        variant="outlined"
        value={value}
        type={type}
        error={!!error}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <StyledError>
          <RiErrorWarningLine />
          <Typography>{error}</Typography>
        </StyledError>
      )}
    </StyledContainer>
  );
}

export { Input };

const StyledContainer = styled(StyledFlexColumn)({
  gap: 2,
  position: "relative",
});

const StyledError = styled(StyledFlexRow)({
  position: "absolute",
  top: "calc(100% + 2px)",
  width: "100%",
  paddingLeft: 5,
  justifyContent: "flex-start",
  gap: 5,
  p: {
    fontSize: 13,
    color: "red",
    textAlign: "left",
    fontWeight: 600,
  },
});

const StyledInput = styled(TextField)({
  width: "100%",
  fieldset: {
    borderRadius: 10,
  },
  input: {
    fontSize: 16,
    // padding: "12.5px 14px 15.5px 14px",
    fontWeight: 500,
  },
});
