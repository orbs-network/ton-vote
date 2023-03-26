import { TextField, styled, Typography, Box } from "@mui/material";
import React, {
  Component,
  ComponentElement,
  ElementType,
  FunctionComponent,
  JSXElementConstructor,
  ReactComponentElement,
  ReactElement,
  useCallback,
} from "react";
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

interface TextInputProps {
  value: string | number;
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
}

export function TextInput({
  value,
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
}: TextInputProps) {
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

interface UploadInputProps {
  onChange: (file: File) => void;
  className?: string;
  value?: File;
}

export function UploadInput({
  onChange,
  className = "",
  value,
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
      {value && <StyledUploadImg src={URL.createObjectURL(value)} />}
      <StyledUpload
        {...getRootProps()}
        className={className}
        active={isDragActive}
      >
        <BsUpload />
        <input {...getInputProps()} />
      </StyledUpload>
    </StyledUploadContainer>
  );
}

const StyledUploadImg = styled(Img)({
  width: 150,
  height: 150,
  borderRadius:'50%'
});

const StyledUploadContainer = styled(StyledFlexRow)({
  gap: 150
});

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

interface DateRangeInput {
  className?: string;
  onChange: (value: number) => void;
  title?: string;
  error?: string;
  onFocus?: () => void;
  minDate?: string;
}

export const DateRangeInput = ({
  className = "",
  onChange,
  title,
  error,
  onFocus,
  minDate,
}: DateRangeInput) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatepicker className={className}>
        {title && <StyledTitle>{title}</StyledTitle>}
        <DateTimePicker
          // minDateTime={dayjs().startOf('D')}
          onOpen={onFocus}
          className="datepicker"
          onChange={(value: any) => onChange(dayjs(value).unix().valueOf())}
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
  },
  input: {
    fontSize: 14,
  },
});

export function MapInput<T>({
  input,
  formik,
  EndAdornment,
}: {
  input: InputInterface;
  formik: FormikProps<T>;
  EndAdornment?: any;
}) {
  const name = input.name;
  const value = formik.values[name as keyof T];
  const error = formik.errors[name as keyof T] as string;
  const label = input.label;
  const clearError = () => formik.setFieldError(name as string, undefined);
  const onChange = (value: any) => formik.setFieldValue(name as string, value);
  if (input.type === "date") {
    return (
      <DateRangeInput
        onChange={onChange}
        title={label}
        error={error as string}
        onFocus={clearError}
      />
    );
  }
  if (input.type === "upload") {
    return <UploadInput onChange={onChange} value={value as File} />;
  }
  return (
    <TextInput
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
          <EndAdornment
            onClick={() =>
              formik.setFieldValue(name as string, input.defaultValue)
            }
          />
        ) : undefined
      }
    />
  );
}
