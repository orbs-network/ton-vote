import {
  styled,
  Typography,
  Checkbox,
  IconButton,
} from "@mui/material";
import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyledCreateAbout, StyledFlexColumn, StyledFlexRow } from "styles";
import { RiErrorWarningLine } from "react-icons/ri";
import { useDropzone } from "react-dropzone";
import { BsFillTrash3Fill, BsUpload } from "react-icons/bs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { FormArgs, ListInputOption, InputArgs } from "types";
import { FormikProps } from "formik";
import { AppTooltip } from "../Tooltip";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { Markdown } from "../Markdown";
import { AiOutlinePlus } from "react-icons/ai";
import {
  StyledAddMoreButton,
  StyledChars,
  StyledContainer,
  StyledDatepicker,
  StyledError,
  StyledFormInput,
  StyledInput,
  StyledInputHeader,
  StyledListInputPrefix,
  StyledListTextInput,
  StyledPreview,
  StyledPreviewBox,
  StyledPreviewButton,
  StyledUpload,
  StyledUploadContainer,
  StyledUploadImg,
  StyledTitle,
} from "./styles";
import { TitleContainer } from "components/TitleContainer";

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
  required?: boolean;
  limit?: number;
  startAdornment?: ReactNode;
  disabled?: boolean;
  isMarkdown?: boolean;
  defaultValue?: any;
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
  className = "",
  tooltip,
  required,
  limit,
  startAdornment,
  disabled,
  isMarkdown,
  defaultValue,
}: TextInputProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(false);

  const _onChange = (_value: string) => {
    if (!limit) {
      onChange(_value);
    } else if (_.size(value.toString()) <= limit) {
      onChange(_value);
    } else if (_.size(_value) < _.size(value.toString())) {
      onChange(_value);
    }
  };

  return (
    <StyledContainer className={`${className} text-input`}>
      <InputHeader
        value={value.toString()}
        limit={limit}
        title={title}
        required={required}
        tooltip={tooltip}
      />
      <div style={{ position: "relative", width: "100%" }}>
        {isMarkdown && _.size(value.toString()) > 0 && (
          <StyledPreviewBox justifyContent="flex-end">
            <StyledPreviewButton onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </StyledPreviewButton>
            <StyledPreviewButton
              onClick={() =>
                window.open(
                  "https://www.markdownguide.org/basic-syntax/",
                  "_blank"
                )
              }
            >
              Help
            </StyledPreviewButton>
          </StyledPreviewBox>
        )}
        {preview ? (
          <PreviewInput md={value as string} />
        ) : (
          <StyledInput
            markdown={isMarkdown ? 1 : 0}
            placeholder={placeholder}
            preview={preview ? 1 : 0}
            onBlur={onBlur}
            name={name}
            rows={rows}
            disabled={disabled}
            multiline={rows ? true : false}
            onFocus={onFocus}
            variant="outlined"
            value={value}
            error={!!error}
            label={label}
            onChange={(e) => _onChange(e.target.value)}
            InputProps={{ endAdornment, startAdornment }}
          />
        )}
      </div>

      {error && (
        <StyledError>
          <RiErrorWarningLine />
          <Typography>{error}</Typography>
        </StyledError>
      )}
    </StyledContainer>
  );
}

const PreviewInput = ({ md }: { md: string }) => {
  return (
    <StyledPreview>
      <Markdown>{md}</Markdown>
    </StyledPreview>
  );
};

export const InputHeader = ({
  title,
  tooltip,
  limit,
  required,
  value,
}: {
  title?: string;
  tooltip?: string;
  limit?: number;
  required?: boolean;
  value?: string;
}) => {
  const charsAmount = _.size(value || "");

  if (!title) return null;
  return (
    <StyledInputHeader>
      <StyledFlexRow justifyContent="flex-start" width="auto">
        <Title title={title} required={required} />
        {tooltip && <AppTooltip placement="right" info markdown={tooltip} />}
      </StyledFlexRow>

      {limit && (
        <StyledChars>
          {charsAmount}/{limit}
        </StyledChars>
      )}
    </StyledInputHeader>
  );
};

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

const Title = ({ title, required }: { title: string; required?: boolean }) => {
  return (
    <StyledTitle>
      {title}
      {required ? " (required)" : " (optional)"}
    </StyledTitle>
  );
};

interface DateRangeInputProps {
  className?: string;
  onChange: (value: number) => void;
  title?: string;
  error?: string;
  onFocus?: () => void;
  min?: number;
  max?: number;
  value?: number | string;
  required?: boolean;
  tooltip?: string;
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
  required,
  tooltip,
}: DateRangeInputProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatepicker
        className={`${className} date-input`}
        error={error ? 1 : 0}
      >
        <StyledInputHeader>
          {title && <Title title={title} required={required} />}
          {tooltip && <AppTooltip info markdown={tooltip} />}
        </StyledInputHeader>

        <DateTimePicker
          // maxDate={max && dayjs(max)}
          // minDate={min && dayjs(min)}
          value={value ? dayjs(value) : null}
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

export function MapInput<T>({
  args,
  value,
  error,
  EndAdornment,
  className,
  onChange,
  customInputHandler,
  clearError,
}: {
  args: InputArgs;
  value: any;
  error?: string;
  EndAdornment?: any;
  className?: string;
  onChange: (value: any) => void;
  customInputHandler?: (value: InputArgs) => ReactElement;
  clearError?: () => void;
}) {
  const touchedRef = useRef(false);

  useEffect(() => {
    if (value) {
      touchedRef.current = true;
    }
  }, [value]);

  useEffect(() => {
    if (!value && args.default && !touchedRef.current) {
      onChange(args.default);
    }
  }, [args.default, value]);

  const name = args.name;
  const label = args.label;

  const common = {
    required: args.required,
    title: args.label,
    tooltip: args.tooltip,
  };

  if (args.type === "date") {
    return (
      <DateRangeInput
        {...common}
        onChange={onChange}
        error={error as string}
        onFocus={clearError}
        className={className}
        min={args.min}
        max={args.max}
        value={value as any}
      />
    );
  }
  if (args.type === "upload") {
    return (
      <UploadInput title={label} onChange={onChange} value={value as File} />
    );
  }

  if (args.type === "checkbox") {
    return (
      <CheckboxInput {...common} onChange={onChange} value={value as boolean} />
    );
  }
  if (args.type === "list") {
    return (
      <ListInputs
        title={label}
        onChange={onChange}
        values={value as ListInputOption[]}
        required={args.required}
        disabled={args.disabled}
        tooltip={args.tooltip}
      />
    );
  }

  if (args.type === "text" || args.type === "textarea") {
    return (
      <TextInput
        {...args}
        defaultValue={args.default}
        onFocus={clearError}
        key={name}
        error={error}
        title={label}
        label=""
        value={value as string}
        name={name}
        onChange={onChange}
        endAdornment={
          args.defaultValueClick && !value && EndAdornment ? (
            <EndAdornment onClick={() => onChange(args.defaultValueClick)} />
          ) : undefined
        }
      />
    );
  }
  if (args.type === "custom" && customInputHandler) {
    return customInputHandler(args);
  }
  return null;
}

const CheckboxInput = ({
  title,
  onChange,
  value = false,
  required,
}: {
  title: string;
  onChange: (value: boolean) => void;
  value: boolean;
  required?: boolean;
}) => {
  return (
    <StycheckBoxInput justifyContent="flex-start" gap={2}>
      <Checkbox checked={value} onChange={() => onChange(!value)} />
      {title && <StyledCheckBoxTitle title={title} required={required} />}
    </StycheckBoxInput>
  );
};

const StyledCheckBoxTitle = styled(Title)({
  width: "unset",
});

const StycheckBoxInput = styled(StyledFlexRow)({});

interface ListProps {
  values: ListInputOption[];
  onChange: (value: ListInputOption[]) => void;
  title: string;
  required?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export const ListInputs = ({
  values = [],
  title,
  required,
  onChange,
  disabled,
  tooltip,
}: ListProps) => {
  const onInputChange = (key: string, _value: string) => {
    const newValue = values.map((it) => {
      if (it.key === key) {
        return { ...it, value: _value };
      }
      return it;
    });
    onChange(newValue);
  };

  const addOption = () => {
    const newValue = [...values, { key: crypto.randomUUID(), value: "" }];
    onChange(newValue);
  };

  const deleteOption = (key: string) => {
    const newValue = values.filter((it) => it.key !== key);
    onChange(newValue);
  };

  return (
    <StyledContainer>
      <InputHeader tooltip={tooltip} title={title} required={required} />
      <StyledFlexColumn gap={15} alignItems="flex-start">
        {values.map((it, index) => {
          const isLast = index === values.length - 1;
          return (
            <StyledFlexRow justifyContent="flex-start" key={it.key}>
              <StyledListTextInput>
                <TextInput
                  disabled={disabled}
                  endAdornment={
                    !disabled &&
                    index > 0 && (
                      <AppTooltip text="Delete choice">
                        <IconButton onClick={() => deleteOption(it.key)}>
                          <BsFillTrash3Fill
                            style={{
                              width: 17,
                              height: 17,
                              cursor: "pointer",
                            }}
                          />
                        </IconButton>
                      </AppTooltip>
                    )
                  }
                  startAdornment={
                    <StyledListInputPrefix>
                      Option {index + 1}
                    </StyledListInputPrefix>
                  }
                  onChange={(value) => onInputChange(it.key, value)}
                  value={it.value}
                />
              </StyledListTextInput>
              {!disabled && isLast && (
                <AppTooltip text="Add option">
                  <StyledAddMoreButton onClick={addOption}>
                    <AiOutlinePlus style={{ width: 17, height: 17 }} />
                  </StyledAddMoreButton>
                </AppTooltip>
              )}
            </StyledFlexRow>
          );
        })}
      </StyledFlexColumn>
    </StyledContainer>
  );
};

interface FormikInputsFormProps<T> {
  form: FormArgs[];
  formik: FormikProps<T>;
  EndAdornment?: any;
  customInputHandler?: (value: InputArgs) => ReactElement;
}

export function FormikInputsForm<T>({
  form,
  formik,
  EndAdornment,
  customInputHandler,
}: FormikInputsFormProps<T>) {
  return (
    <StyledFlexColumn gap={15}>
      {form.map((it, index) => {
        return (
          <TitleContainer key={index} title={it.title}>
            <StyledFlexColumn gap={30}>
              {it.subTitle && (
                <StyledCreateAbout>{it.subTitle}</StyledCreateAbout>
              )}
              <StyledFlexColumn gap={20}>
                {it.inputs.map((input) => {
                  const clearError = () =>
                    formik.setFieldError(input.name as string, undefined);
                  return (
                    <StyledFormInput key={input.name} className="form-input">
                      <MapInput<T>
                        customInputHandler={customInputHandler}
                        EndAdornment={EndAdornment}
                        args={input}
                        value={formik.values[input.name as keyof T]}
                        error={formik.errors[input.name as keyof T] as string}
                        clearError={clearError}
                        onChange={(value: any) => {
                          formik.setFieldValue(input.name as string, value);
                          clearError();
                        }}
                      />
                    </StyledFormInput>
                  );
                })}
              </StyledFlexColumn>
            </StyledFlexColumn>
          </TitleContainer>
        );
      })}
    </StyledFlexColumn>
  );
}
