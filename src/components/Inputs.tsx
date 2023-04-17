import { TextField, styled, Typography, Box, Checkbox } from "@mui/material";
import React, { useCallback, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { RiErrorWarningLine } from "react-icons/ri";
import { useDropzone } from "react-dropzone";
import { BsUpload } from "react-icons/bs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { InputInterface } from "types";
import { FormikProps } from "formik";
import { Img } from "./Img";
import { AppTooltip } from "./Tooltip";

interface TextInputProps {
  value?: string | number;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  onFocus?: () => void;
  rows?: number;
  onBlur?: () => void;
  placeholder?: string;
  title?: string;
  name?: string;
  className?: string;
  endAdornment?: React.ReactNode;
  tooltip?: string;
}

export function TextInput({
  value = "",
  onChange,
  label,
  error,
  onFocus,
  rows,
  onBlur,
  placeholder,
  title,
  name,
  endAdornment,
  className,
  tooltip,
}: TextInputProps) {
  return (
    <StyledContainer className={`${className} text-input`}>
      <StyledInputHeader>
        {title && <StyledTitle>{title}</StyledTitle>}
        {tooltip && <AppTooltip info text={tooltip} />}
      </StyledInputHeader>
      <StyledInput
        placeholder={placeholder}
        onBlur={onBlur}
        name={name}
        rows={rows}
        multiline={rows && rows > 1 ? true : false}
        onFocus={onFocus}
        variant="outlined"
        value={value}
        error={!!error}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{ endAdornment }}
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

const StyledInputHeader = styled(StyledFlexRow)({
  marginBottom: 5,
  justifyContent:'flex-start'
})

interface UploadInputProps {
  onChange: (file: File) => void;
  className?: string;
  value?: File;
  title: string;
}

export function UploadInput({
  onChange,
  className = "",
  value,
  title,
}: UploadInputProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  return (
    <StyledUploadContainer>
      {title && <StyledTitle>{title}</StyledTitle>}
      <StyledUpload
        {...getRootProps()}
        className={`${className} upload-input`}
        active={isDragActive}
      >
        {value && <StyledUploadImg src={URL.createObjectURL(value)} />}
        <BsUpload />
        <input {...getInputProps()} />
      </StyledUpload>
    </StyledUploadContainer>
  );
}

const StyledUploadContainer = styled(StyledFlexColumn)({
  alignItems: "flex-start",
});

const StyledUploadImg = styled(Img)({
  width: "100%",
  height: "100%",
});

const StyledUpload = styled("div")<{ active: boolean }>(({ active }) => ({
  width: 110,
  height: 110,
  background: "rgba(211, 211, 211, 0.6)",
  borderRadius: "50%",
  position: "relative",
  cursor: "pointer",
  overflow: "hidden",
  svg: {
    transition: "0.2s all",
    width: 35,
    height: 35,
    position: "absolute",
    top: "50%",
    transform: active
      ? "translate(-50%, -50%) scale(1.2)"
      : "translate(-50%, -50%)",
    left: "50%",
  },
  ".img": {
    transition: "0.2s all",
    position: "relative",
    zIndex: 2,
  },
  "&:hover": {
    ".img": {
      opacity: 0,
    },
    svg: {
      transform: "translate(-50%, -50%) scale(1.1)",
    },
  },
}));

const StyledTitle = styled(Typography)({
  textAlign: "left",
  fontSize: 14,
  fontWeight: 600,
});

const StyledContainer = styled(StyledFlexColumn)({
  gap: 0,
  position: "relative",
});

const StyledError = styled(StyledFlexRow)({
  // position: "absolute",
  // top: "calc(100% + 2px)",
  width: "100%",
  paddingLeft: 5,
  justifyContent: "flex-start",
  gap: 5,
  marginTop: 5,
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
    background: "transparent!important",
    padding: "12.5px 12px",
    fontSize: 16,
    fontWeight: 500,
  },
});

interface DateRangeInput {
  className?: string;
  onChange: (value: number) => void;
  title?: string;
  error?: string;
  onFocus?: () => void;
  min?: number;
  max?: number;
  value?: number | string;
}

export const DateRangeInput = ({
  className = "",
  onChange,
  title,
  error,
  onFocus,
  min,
  max,
  value = "",
}: DateRangeInput) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatepicker className={`${className} date-input`}>
        {title && <StyledTitle>{title}</StyledTitle>}
        <DateTimePicker
          maxDate={max && dayjs(max)}
          minDate={min && dayjs(min)}
          // value={value ? dayjs(value) : ''}
          onOpen={onFocus}
          className="datepicker"
          onChange={(value: any) => onChange(dayjs(value).valueOf())}
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
  alignItems: "flex-start",
  flex: 1,

  fieldset: {
    borderRadius: 10,
    borderColor: "rgba(0, 0, 0, 0.23)",
  },
  input: {
    fontSize: 14,
  },
});

export function MapInput<T>({
  input,
  formik,
  EndAdornment,
  className,
}: {
  input: InputInterface;
  formik: FormikProps<T>;
  EndAdornment?: any;
  className?: string;
}) {
  const name = input.name;
  const value = formik.values[name as keyof T];
  const error = formik.errors[name as keyof T] as string;
  const label = input.label;
  const clearError = () => formik.setFieldError(name as string, undefined);
  const onChange = (value: any) => {
    formik.setFieldValue(name as string, value);
    clearError();
  };

  if (input.type === "date") {
    return (
      <DateRangeInput
        onChange={onChange}
        title={label}
        error={error as string}
        onFocus={clearError}
        className={className}
        min={input.min}
        max={input.max}
        value={value as any}
      />
    );
  }
  if (input.type === "upload") {
    return (
      <UploadInput title={label} onChange={onChange} value={value as File} />
    );
  }
  if (input.type === "checkbox") {
    return (
      <CheckboxInput
        title={label}
        onChange={onChange}
        value={value as boolean}
      />
    );
  }
  return (
    <TextInput
    tooltip={input.tooltip}
      onFocus={clearError}
      key={name}
      error={error}
      title={label}
      value={value as string}
      name={name}
      onChange={onChange}
      rows={input.rows}
      endAdornment={
        input.defaultValue && !value ? (
          <EndAdornment onClick={() => onChange(input.defaultValue)} />
        ) : undefined
      }
    />
  );
}

const CheckboxInput = ({
  title,
  onChange,
  value = false,
}: {
  title: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) => {
  return (
    <StycheckBoxInput justifyContent="flex-start" gap={2}>
      <Checkbox checked={value} onChange={() => onChange(!value)} />
      {title && <StyledCheckBoxTitle>{title}</StyledCheckBoxTitle>}
    </StycheckBoxInput>
  );
};

const StyledCheckBoxTitle = styled(StyledTitle)({
  width: "unset",
});

const StycheckBoxInput = styled(StyledFlexRow)({});
