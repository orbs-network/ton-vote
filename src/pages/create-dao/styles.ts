import { styled } from "@mui/material";
import { Button, TitleContainer } from "components";
import { StyledFlexColumn } from "styles";

export const StyledStepButton = styled(Button)({
    width:'100%'
})

export const StyledInputs = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  gap: 20,
});
