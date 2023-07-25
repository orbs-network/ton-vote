import { styled, Typography } from "@mui/material";
import _ from "lodash";
import { Page } from "wrappers";
import { TypeSelect } from "./steps/TypeSelect/TypeSelect";
import { ActiveAirdrop } from "./ActiveAirdrop";
import { StepsMenuStep } from "types";
import { Button, Popup, StepsLayout } from "components";
import { useAirdropStore } from "./store";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useState } from "react";
import { AirdropFinished } from "./AirdropFinished";
import { SelectDao } from "./steps/SelectDao";
import { SelectProposals } from "./steps/SelectProposals";
import GettingsStarted from "./steps/GettingStarted";

const useSteps = (): StepsMenuStep[] => {
  return [
    {
      title: "Getting started",
      component: GettingsStarted,
    },
    {
      title: "Select a DAO space",
      component: SelectDao,
    },
    {
      title: "Select proposals",
      component: SelectProposals,
    },
    {
      title: "Choose airdrop type",
      component: TypeSelect,
    },
    {
      title: "Transfer assets",
      component: ActiveAirdrop,
    },
    {
      component: AirdropFinished,
    },
  ];
};

export function Airdrop() {
  const steps = useSteps();
  const { step, setStep } = useAirdropStore();
  return (
    <StyledPage title="Airdrop Asistant" hideBack>
      <StepsLayout
        disableBack
        setStep={setStep}
        currentStep={step || 0}
        steps={steps}
      >
        <ResetButton />
      </StepsLayout>
    </StyledPage>
  );
}
const StyledPage = styled(Page)({
  marginLeft: "auto",
  marginRight: "auto",
  // maxWidth: 1000
});

const ResetButton = () => {
  const { reset, step } = useAirdropStore();
  const [open, setOpen] = useState(false);

  if (!step) return null;

    const onReset = () => {
      reset();
      setOpen(false);
    };

  return (
    <StyledFlexRow style={{ marginLeft: "auto", marginTop: 20 }}>
      <StyledResetButton onClick={() => setOpen(true)} variant='text'>Reset</StyledResetButton>
      <StyledWarningPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Reset airdrop"
      >
        <StyledFlexColumn alignItems="flex-start" gap={20}>
          <Typography>Proceeding will delete the current airdrop</Typography>
          <StyledFlexRow>
            <StyledPopupButton onClick={() => setOpen(false)}>
              No
            </StyledPopupButton>
            <StyledPopupButton onClick={onReset}>Yes</StyledPopupButton>
          </StyledFlexRow>
        </StyledFlexColumn>
      </StyledWarningPopup>
    </StyledFlexRow>
  );
};

const StyledResetButton = styled(Button)({
  marginLeft: "auto",
  cursor: "pointer",
  "p": {
    fontSize: 16,
    fontWeight: 500,
  },
});

const StyledPopupButton = styled(Button)({
  width: "50%",
});

const StyledWarningPopup = styled(Popup)({
  maxWidth: 400,
});
