import { styled } from "@mui/material";
import { Button } from "components";
import { StyledFlexColumn } from "styles";

export const StyledNextStepButton = styled(Button)({
    minWidth: 200
})

export const StyledSubmitButton = styled(Button)({
    minWidth: 250
})

export const StyledStep = styled(StyledFlexColumn)({
    gap: 40,
    alignItems:'center'
})