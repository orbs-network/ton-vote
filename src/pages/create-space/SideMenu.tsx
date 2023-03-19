import { styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Container } from "components";
import React, { useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { BsCheckLg } from "react-icons/bs";
import { steps, useCreateSpaceStore } from "./store";



function SideMenu() {
  const { step: currentStep, setStep } = useCreateSpaceStore();

  const onStepSelect = (index: number) => {
    if (index <= currentStep) {
      setStep(index);
    }
  };
  return (
    <StyledContainer>
      <StyledSteps>
        <StyledStepsLine />
        {steps.map((step) => {
          const finished = currentStep > step.index;
          const isCurrent = currentStep === step.index;
          return (
            <StyledStep
              key={step.index}
              onClick={() => onStepSelect(step.index)}
            >
              <StyledIndicator finished={finished}>
                {finished && <BsCheckLg style={{ color: "white" }} />}
                {isCurrent && <StyledDot />}
              </StyledIndicator>
              <Typography>{step.title}</Typography>
            </StyledStep>
          );
        })}
      </StyledSteps>
    </StyledContainer>
  );
}

export { SideMenu };

const StyledStepsLine = styled("figure")(({ theme }) => ({
  width: 1,
  height: "100%",
  top: "50%",
  left: 20,
  transform: "translate(0, -50%)",
  background: theme.palette.primary.main,
  position: "absolute",
  margin: 0,
}));

const StyledDot = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  width: "20%",
  height: "20%",
  borderRadius: "50%",
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
}));

const StyledSteps = styled(StyledFlexColumn)({
  gap: 30,
  position: "relative",
});

const StyledIndicator = styled(StyledFlexRow)<{
  finished: boolean;
}>(({ theme, finished }) => ({
  position: "relative",
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: `2px solid ${theme.palette.primary.main}`,
  background: finished ? theme.palette.primary.main : "white",
}));

const StyledStep = styled(StyledFlexRow)({
  gap: 20,
  justifyContent: "flex-start",
  position: "relative",
});

const StyledContainer = styled(Container)({
  width: 320,
});
