import { styled, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { Button, SideMenu } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { BsCheckLg } from "react-icons/bs";
import { MOBILE_WIDTH } from "consts";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { StepsMenuStep } from "types";

interface Props {
  setStep: (value: number) => void;
  currentStep: number;
  onEdit?: () => void;
  steps: StepsMenuStep[];
  disableBack?: boolean;
  children?: React.ReactNode;
  header?: React.ReactNode;
}

const StepSubtitle = ({ text }: { text: string }) => {
  return <StyledStepSubtitle>{text}</StyledStepSubtitle>;
};

StepsLayout.StepSubtitle = StepSubtitle;

export function StepsLayout({
  steps,
  currentStep,
  setStep,
  onEdit,
  disableBack,
  children,
  header,
}: Props) {
  const theme = useTheme();
  const Component = steps[currentStep]?.component;

  const onClick = (index: number) => {
    if (index < currentStep) {
      setStep(index);
    }
  };

  return (
    <StyledContainer>
      <SideMenu>
        {header}
        <StyledSteps>
          <StyledStepsLine />
          {steps.map((step, index) => {
            if (!step.title) return null;
            const finished = currentStep > index ? true : false;
            const isCurrent = currentStep === index;
            return (
              <StyledStep key={index}>
                <StyledIndicator
                  onClick={() => onClick(index)}
                  style={{
                    background: finished
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                    cursor: disableBack
                      ? "auto"
                      : finished
                      ? "pointer"
                      : "unset",
                  }}
                >
                  {finished && <BsCheckLg style={{ color: "white" }} />}
                  {isCurrent && <StyledDot />}
                </StyledIndicator>
                <StyledTitle>{step.title}</StyledTitle>
              </StyledStep>
            );
          })}
        </StyledSteps>
        {children}
      </SideMenu>

      <StyledStep>{Component && <Component />}</StyledStep>
    </StyledContainer>
  );
}

const StyledTitle = styled(Typography)({
  flex:1
})

const StyledStepSubtitle = styled(Typography)({});

const StyledEdit = styled(Button)({
  padding: "5px 10px",
  height: "unset",
  "*": {
    fontSize: 14,
  },
});

const StyledStepsLine = styled("figure")(({ theme }) => ({
  width: 1,
  height: "100%",
  top: "50%",
  left: 20,
  transform: "translate(0, -50%)",
  background: theme.palette.primary.main,
  position: "absolute",
  margin: 0,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    left: 15,
  },
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
  alignItems: "flex-start",
  position: "relative",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    gap: 15,
  },
});

const StyledIndicator = styled(StyledFlexRow)(({ theme }) => ({
  position: "relative",
  width: 40,
  height: 40,
  borderRadius: "50%",

  border: `2px solid ${theme.palette.primary.main}`,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: 30,
    height: 30,
  },
}));

const StyledStep = styled(StyledFlexRow)({
  gap: 20,
  justifyContent: "flex-start",
  position: "relative",
  width: "auto",
  flex: 1,
});

const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
  width: "100%",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    flexDirection: "column",
  },
});
