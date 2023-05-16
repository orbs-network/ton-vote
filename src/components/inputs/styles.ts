import { Box, styled, TextField, Typography } from "@mui/material";
import { Button } from "components/Button";
import { Img } from "components/Img";
import { StyledFlexColumn, StyledFlexRow } from "styles";

export const StyledUpload = styled("div")<{ active: boolean }>(
  ({ active }) => ({
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
  })
);

export const StyledUploadContainer = styled(StyledFlexColumn)({
  alignItems: "flex-start",
});

export const StyledUploadImg = styled(Img)({
  width: "100%",
  height: "100%",
});

export const StyledAddMoreButton = styled(Button)({
  width: "auto",
  height: "auto",
  borderRadius: "50%",
  padding: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const StyledListTextInput = styled(StyledFlexRow)({
  maxWidth: 400,
});

export const StyledListInputPrefix = styled(Typography)({
  whiteSpace: "nowrap",
  opacity: 0.6,
});

export const StyledFormInput = styled(Box)({
  width: "100%",
});
export const StyledContainer = styled(StyledFlexColumn)({
  gap: 0,
  position: "relative",
});

export const StyledSelectBoxInput = styled(StyledContainer)({
  alignItems: "flex-start",
  ".MuiSelect-select": {
    minWidth: 200,
    padding: "12.2px 15px",
  },
  fieldset: {
    borderRadius: 10,
  },
});

export const StyledError = styled(StyledFlexRow)({
  width: "100%",
  paddingLeft: 5,
  justifyContent: "flex-start",
  gap: 5,
  marginTop: 5,
  alignItems:'flex-start',
  p: {
    fontSize: 13,
    color: "#d32f2f",
    textAlign: "left",
    fontWeight: 600,
  },
  svg: {
    color: "#d32f2f",
    position:'relative',
    top:3
  },
});

export const StyledPreviewBox = styled(StyledFlexRow)({
  position: "absolute",
  top: 5,
  right: 5,
  gap: 5,
  cursor: "pointer",
  a: {
    fontSize: 14,
  },
});

export const StyledPreviewButton = styled(Button)({
  padding: "3px 10px",
  height: "auto",

  zIndex: 1,
  borderRadius: 12,
  "*": {
    fontSize: 12,
  },
});

export const StyledInputContainer = styled(Box)<{
  markdown?: number;
  preview?: number;
}>(({ markdown, preview }) => ({
  width: "100%",
  fieldset: {
    borderRadius: 10,
  },
  ".MuiFormControl-root": {
    width: "100%",
  },
  ".MuiInputBase-root": {
    paddingBottom: markdown ? "30px" : "unset",
    paddingTop: markdown ? "32px" : "unset",
  },
  textarea: {
    fontFamily: markdown && !preview ? "monospace!important" : "inherit",
    color: markdown && !preview ? "black" : "inherit",
  },
  input: {
    background: "transparent!important",
    padding: "12.5px 12px",
    fontSize: 16,
    fontWeight: 500,

    "::placeholder": {
      opacity: 1,
    },
  },
}));

export const StyledPreview = styled(Box)({
  padding: "30px 13px 20px 13px",
  border: "1px solid rgba(0, 0, 0, 0.23)",
  borderRadius: 10,
});

export const StyledChars = styled(Typography)({
  fontSize: 14,
});

export const StyledInputHeader = styled(StyledFlexRow)({
  marginBottom: 10,
  justifyContent: "flex-start",
});

export const StyledTitle = styled(Typography)({
  textAlign: "left",
  fontSize: 14,
  fontWeight: 600,
});

export const StyledDatepicker = styled(StyledContainer)<{ error: number }>(
  ({ error }) => ({
    alignItems: "flex-start",
    flex: 1,
    fieldset: {
      borderRadius: 10,
      borderColor: error ? "#d32f2f" : "rgba(0, 0, 0, 0.23)",
    },
    input: {
      fontSize: 14,
    },
  })
);
