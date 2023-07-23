import { styled, Typography } from "@mui/material";
import _ from "lodash";
import { Page } from "wrappers";
import { SetupAirdrop } from "./SetupAirdrop/SetupAirdrop";
import { ActiveAirdrop } from "./ActiveAirdrop";
import SelectVoters from "./SelectVoters/SelectVoters";
import { StepsMenuStep } from "types";
import { Button, Popup, StepsLayout } from "components";
import { useAirdropStore } from "store";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useState } from "react";
import { AirdropFinished } from "./AirdropFinished";

const useSteps = (): StepsMenuStep[] => {
  return [
    {
      title: "Select Voters",
      component: SelectVoters,
    },
    {
      title: "Setup airdrop",
      component: SetupAirdrop,
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
    <StyledPage title="Airdrop" back={"/"}>
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
      <StyledResetButton onClick={() => setOpen(true)}>Reset</StyledResetButton>
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
  height: "auto",
  padding: "7px 13px",
  "*": {
    fontSize: 14,
  },
});

const StyledPopupButton = styled(Button)({
  width: "50%",
});

const StyledWarningPopup = styled(Popup)({
  maxWidth: 400,
});
