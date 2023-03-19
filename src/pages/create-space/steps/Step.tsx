import { styled, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import { StyledFlexColumn } from "styles";
import { NextStepButton } from "../NextStepButton";
import { useCreateSpaceStore } from "../store";

interface Props{
    title: string
    children: ReactNode
}

function Step({ children, title }: Props) {
  return (
    <StyledContainer>
      <StyledTitle variant="h4">{title}</StyledTitle>
      {children}
    </StyledContainer>
  );
}

export default Step;

const StyledTitle = styled(Typography)({
    textAlign:'left',
    fontSize: 16,
    fontWeight: 600
})

const StyledContainer = styled(StyledFlexColumn)({
    alignItems:'flex-start'
});
