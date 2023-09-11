import { styled, Typography } from "@mui/material";
import _ from "lodash";
import { Page } from "wrappers";
import { TypeSelect } from "./steps/TypeSelect/TypeSelect";
import { TransferAssets } from "./steps/TransferAssets/TransferAssets";
import { StepsMenuStep } from "types";
import { Back, Button, Popup, StepsLayout } from "components";
import { useAirdropStore } from "./store";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useEffect, useState } from "react";
import { AirdropFinished } from "./AirdropFinished";
import GettingsStarted from "./steps/GettingStarted";
import { useEnsureProposalQuery } from "query/getters";
import { useAppQueryParams } from "hooks/hooks";
import { validateAddress } from "utils";
import { VotersSelect } from "./steps/VotersSelect/VotersSelect";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { useAirdropStarted, useMakeAirdropStoreCopy } from "./hooks";
import { Webapp } from "WebApp";
import { useAppNavigation } from "router/navigation";

const useSteps = (): StepsMenuStep[] => {
  const t = useAirdropTranslations();
  return [
    {
      title: t.titles.gettingStarted,
      component: GettingsStarted,
    },
    {
      title: t.titles.selectedAssetCategory,
      component: TypeSelect,
    },
    {
      title: t.titles.generateDstWallets,
      component: VotersSelect,
    },

    {
      title: t.titles.transferAssets,
      component: TransferAssets,
    },
    {
      component: AirdropFinished,
    },
  ];
};

export function Airdrop() {
  const { step, setStep } = useAirdropStore();
  const steps = useSteps();
  useHanldeProposalFromQueryParams();
  const { daosPage } = useAppNavigation();
  const airdropStarted = useAirdropStarted();
  const makeCopy = useMakeAirdropStoreCopy();
  useEffect(() => {
    if (airdropStarted) {
      makeCopy();
    }
  }, [airdropStarted]);

  return (
    <StyledPage>
      <Page.Header>
        {Webapp.isEnabled && <Back back={daosPage.root} />}
        <Page.Title title="Airdrop Assistant" />
      </Page.Header>
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

const useHanldeProposalFromQueryParams = () => {
  const {
    query: { airdropProposal },
    setAirdropProposal,
  } = useAppQueryParams();
  const { reset, setDao, selectProposal } = useAirdropStore();
  const getProposal = useEnsureProposalQuery();

  const onProposalFromQuery = async (address: string) => {
    try {
      const result = await getProposal(address);
      reset();
      setDao(result?.daoAddress || "");
      selectProposal(airdropProposal || "");
      setAirdropProposal("");
    } catch (error) {}
  };

  useEffect(() => {
    if (airdropProposal && validateAddress(airdropProposal)) {
      onProposalFromQuery(airdropProposal);
    }
  }, [airdropProposal]);
};

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
      <StyledResetButton onClick={() => setOpen(true)} variant="text">
        Reset
      </StyledResetButton>
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
  p: {
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
