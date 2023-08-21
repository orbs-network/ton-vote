import { Step, StepLabel, Stepper, styled, Typography } from "@mui/material";
import { Button, Popup } from "components";
import { useAppParams } from "hooks/hooks";
import _ from "lodash";
import { useCreateMetadataQuery, useSetDaoMetadataQuery } from "query/setters";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyledFlexColumn } from "styles";
import { DaoMetadataForm } from "types";
import { prepareMetadata } from "./utils";

interface ContextValues {
  step: number;
  nextStep: () => void;
  showSteps: boolean;
  setShowSteps: () => void;
  formData: DaoMetadataForm;
  metadataAddress?: string;
  setMetadataAddress: (address: string) => void;
  onClose: () => void;
}

const Context = createContext({
  step: 0,
} as ContextValues);

export function UpdateWizard({
  open,
  onClose,
  formData,
}: {
  onClose: () => void;
  open: boolean;
  formData: DaoMetadataForm;
}) {
  const [showSteps, setShowSteps] = useState(false);
  const [step, setStep] = useState(0);
  const [metadataAddress, setMetadataAddress] = useState<string | undefined>(
    undefined
  );

  const formDataRef = useRef<DaoMetadataForm | undefined>();
  const wasPreviouslyOpen = useRef(false);

  useEffect(() => {
    if (open && !_.isEqual(formDataRef.current, formData)) {
      setStep(0);
      setShowSteps(showSteps);
      setMetadataAddress(undefined);
    }
    formDataRef.current = formData;
  }, [open]);

  return (
    <Context.Provider
      value={{
        onClose,
        step,
        nextStep: () => setStep((prev) => prev + 1),
        showSteps,
        setShowSteps: () => setShowSteps(true),
        formData,
        metadataAddress,
        setMetadataAddress,
      }}
    >
      <StyledContainer title="Update space" open={open} onClose={onClose}>
        {showSteps ? <Steps /> : <Intro />}
      </StyledContainer>
    </Context.Provider>
  );
}

const Intro = () => {
  const { setShowSteps } = useContext(Context);
  return (
    <StyledFlexColumn gap={40}>
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </Typography>
      <StyledIntroBtn onClick={setShowSteps}>Next</StyledIntroBtn>
    </StyledFlexColumn>
  );
};

const StyledIntroBtn = styled(Button)({
  minWidth: 200,
});

const steps = ["Create metadata", "Set metadata"];
const Steps = () => {
  const { step } = useContext(Context);
  const { text, onClick, isLoading } = useButton();
  return (
    <StyledFlexColumn gap={50}>
      <StyledStepper activeStep={step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </StyledStepper>
      <StepText />
      <StyledStepButton isLoading={isLoading} onClick={onClick}>
        {text}
      </StyledStepButton>
    </StyledFlexColumn>
  );
};

const StepText = () => {
  const { step } = useContext(Context);

  if (step === 0) {
    return (
      <TextContainter>
        <Typography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>
      </TextContainter>
    );
  }
  if (step === 1) {
    return (
      <TextContainter>
        <Typography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>
      </TextContainter>
    );
  }
  return (
    <TextContainter>
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
    </TextContainter>
  );
};

const TextContainter = ({ children }: { children: ReactNode }) => {
  return <StyledTextContainter>{children}</StyledTextContainter>;
};

const StyledTextContainter = styled(StyledFlexColumn)({
  textAlign: "center",
});

const useButton = () => {
  const { daoAddress } = useAppParams();
  const {
    step,
    formData,
    nextStep,
    setMetadataAddress,
    metadataAddress,
    onClose,
  } = useContext(Context);
  const { mutate: createMetadata, isLoading: createMetadataLoading } =
    useCreateMetadataQuery();
  const { mutate: setMetadata, isLoading: setMetadataLoading } =
    useSetDaoMetadataQuery();

  const onClick = () => {
    if (step === 0) {
      return nextStep();
      return createMetadata({
        metadata: prepareMetadata(formData),
        onSuccess: (address) => {
          nextStep();
          setMetadataAddress(address);
        },
      });
    }
    if (step === 1) {
      return nextStep();
      return setMetadata({
        metadataAddress: metadataAddress!,
        daoAddress,
        onSuccess: () => nextStep(),
      });
    }
    return onClose();
  };

  const text = useMemo(() => {
    if (step === 0) {
      return "Create metadata";
    }
    if (step === 1) {
      return "Set metadata";
    }
    if (step === 2) {
      return "Close";
    }
    return "Close";
  }, [step]);

  return {
    text,
    onClick,
    isLoading: createMetadataLoading || setMetadataLoading,
  };
};

const StyledStepper = styled(Stepper)({
  width: "100%",
});

const StyledStepButton = styled(Button)({
  minWidth: 200,
});

const StyledContainer = styled(Popup)({
  maxWidth: 600,
});
