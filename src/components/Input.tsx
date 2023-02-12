import { TextField , styled, Typography } from "@mui/material";
import React from "react";
import { StyledFlexColumn } from "styles";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
  onFocus?: () => void;
  type?: 'text' | 'password';
}

function Input({ value, onChange, label, error, onFocus, type = 'text' }: Props) {
  return (
    <StyledContainer>
      <StyledInput
        onFocus={onFocus}
        variant="outlined"
        value={value}
        type={type}
        error={!!error}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <StyledError>{error}</StyledError>}
    </StyledContainer>
  );
}

export { Input };

const StyledContainer = styled(StyledFlexColumn)({
    gap: 2
})

const StyledError = styled(Typography)({
  fontSize: 14,
  color: "red",
  textAlign: "left",
  width: "100%",
  paddingLeft: 10
});

const StyledInput = styled(TextField)({
  width: "100%",
  fieldset: {
    borderRadius: 10,
  },
  input: {
    fontSize: 16,
    // padding: "12.5px 14px 15.5px 14px",
    fontWeight: 500
  },
});
