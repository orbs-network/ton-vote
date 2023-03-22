import { TextField, styled, Typography, Box } from "@mui/material";
import React, { useCallback } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { RiErrorWarningLine } from "react-icons/ri";
import { useDropzone } from "react-dropzone";
import { BsUpload } from "react-icons/bs";
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
  placeholder?: string;
  title?: string;
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
  title,
}: Props) {
  return (
    <StyledContainer>
      {title && <StyledTitle>{title}</StyledTitle>}
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

interface UploadInputProps {
  onChange: (file: File) => void;
  className?: string;
}

function UploadInput({ onChange, className = "" }: UploadInputProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  return (
    <StyledUpload
      {...getRootProps()}
      className={className}
      isDragActive={isDragActive}
    >
      <BsUpload />
      <input {...getInputProps()} />
    </StyledUpload>
  );
}

const StyledUpload = styled(Box)<{ isDragActive: boolean }>(
  ({ isDragActive }) => ({
    background: "rgba(211, 211, 211, 0.6)",
    borderRadius: 20,
    position: "relative",
    cursor: "pointer",
    svg: {
      transition:'0.2s all',
      width: 50,
      height: 50,
      position: "absolute",
      top: "50%",
      transform: isDragActive
        ? "translate(-50%, -50%) scale(1.2)"
        : "translate(-50%, -50%)",
      left: "50%",
    },
    "&:hover":{
      svg:{
        transform:  "translate(-50%, -50%) scale(1.2)"
      }
    }
  })
);

export { Input, UploadInput };

const StyledTitle = styled(Typography)({
  textAlign: "left",
  width: "100%",
});

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
