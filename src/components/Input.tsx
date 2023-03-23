import { TextField, styled, Typography, Box } from "@mui/material";
import React, { useCallback } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { RiErrorWarningLine } from "react-icons/ri";
import { useDropzone } from "react-dropzone";
import { BsUpload } from "react-icons/bs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { InputType } from "types";

interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  onFocus?: () => void;
  type?: "text" | "password";
  rows?: number;
  onBlur?: () => void;
  placeholder?: string;
  title?: string;
  name?: string;
}

function Input({
  value,
  onChange,
  label,
  error,
  onFocus,
  type = "text",
  rows,
  onBlur,
  placeholder,
  title,
  name,
}: InputProps) {
  return (
    <StyledContainer>
      {title && <StyledTitle>{title}</StyledTitle>}
      <StyledInput
        placeholder={placeholder}
        onBlur={onBlur}
        name={name}
        rows={rows}
        multiline={rows && rows > 1 ? true : false}
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
      active={isDragActive}
    >
      <BsUpload />
      <input {...getInputProps()} />
    </StyledUpload>
  );
}

const StyledUpload = styled("div")<{ active: boolean }>(({ active }) => ({
  background: "rgba(211, 211, 211, 0.6)",
  borderRadius: 20,
  position: "relative",
  cursor: "pointer",
  svg: {
    transition: "0.2s all",
    width: 50,
    height: 50,
    position: "absolute",
    top: "50%",
    transform: active
      ? "translate(-50%, -50%) scale(1.2)"
      : "translate(-50%, -50%)",
    left: "50%",
  },
  "&:hover": {
    svg: {
      transform: "translate(-50%, -50%) scale(1.2)",
    },
  },
}));

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
    fontWeight: 500,
  },
});

export const DateRangeSelect = ({
  className = "",
  onChange,
  title,
  error,
  onFocus,
  minDate,
}: {
  className?: string;
  onChange: (value: number) => void;
  title?: string;
  error?: string;
  onFocus: () => void;
  minDate?: string;
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatepicker className={className}>
        {title && <StyledTitle>{title}</StyledTitle>}
        <DateTimePicker
          // minDateTime={dayjs().startOf('D')}
          onOpen={onFocus}
          className="datepicker"
          onChange={(value: any) =>
            onChange(dayjs(value).unix().valueOf())
          }
          format={"DD/MM/YYYY HH:mm"}
        />
        {error && (
          <StyledError>
            <RiErrorWarningLine />
            <Typography>{error}</Typography>
          </StyledError>
        )}
      </StyledDatepicker>
    </LocalizationProvider>
  );
};


const StyledDatepicker = styled(StyledContainer)({
  alignItems:'flex-start',
  flex: 1,
  fieldset: {
    borderRadius: 10,
  },
  input: {
    fontSize: 14,
  },
});

export const getInput = (type: InputType) => {
  switch (type) {
    case "date":
      return DateRangeSelect;

    default:
      return Input;
  }
};
