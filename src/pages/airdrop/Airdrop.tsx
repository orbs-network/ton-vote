import { styled, Typography } from "@mui/material";
import _ from "lodash";
import { Page } from "wrappers";
import { TypeSelect } from "./steps/TypeSelect/TypeSelect";
import { TransferAssets } from "./steps/TransferAssets/TransferAssets";
import { StepsMenuStep } from "types";
import { Button, Popup, StepsLayout } from "components";
import { useAirdropStore } from "./store";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useEffect, useState } from "react";
import { AirdropFinished } from "./AirdropFinished";
import { SelectDao } from "./steps/SelectDao";
import { SelectProposals } from "./steps/SelectProposals";
import GettingsStarted from "./steps/GettingStarted";
import { VotersSelect } from "./steps/VotersSelect/VotersSelect";
import {
  useEnsureProposalQuery,
  useGetWalletNFTCollectionItemsCallback,
  useProposalQuery,
  useReadNftCollectionMetadata,
  useWalletNFTCollectionItemsQuery,
} from "query/getters";
import { useTonAddress } from "@tonconnect/ui-react";
import { useQueryParam } from "use-query-params";
import { useAppQueryParams } from "hooks/hooks";
import { validateAddress } from "utils";

const useSteps = (): StepsMenuStep[] => {
  return [
    {
      title: "Getting started",
      component: GettingsStarted,
    },
    {
      title: "Choose airdrop type",
      component: TypeSelect,
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
      title: "Select voters",
      component: VotersSelect,
    },

    {
      title: "Transfer assets",
      component: TransferAssets,
    },
    {
      component: AirdropFinished,
    },
  ];
};

export function Airdrop() {
  return (
    <StyledPage title="Airdrop Asistant" hideBack>
      <Steps />
    </StyledPage>
  );
}

const useHanldeProposalFromQueryParams = () => {
  const {
    query: { airdropProposal },
    setAirdropProposal
  } = useAppQueryParams();
  const { reset, setDao, selectProposal } = useAirdropStore();
  const getProposal = useEnsureProposalQuery();


  const onProposalFromQuery = async (address: string) => {
    try {
      const result = await getProposal(address);
      reset();
      setDao(result?.daoAddress || "");
      selectProposal(airdropProposal || '');
      setAirdropProposal('');
    } catch (error) {}
  };

  useEffect(() => {
    if (airdropProposal && validateAddress(airdropProposal)) {
      onProposalFromQuery(airdropProposal);
    }
  }, [airdropProposal]);
};

const Steps = () => {
  const { step, setStep, nftCollection } = useAirdropStore();
  const steps = useSteps();
  useWalletNFTCollectionItemsQuery(nftCollection);
  useHanldeProposalFromQueryParams();

  return (
    <StepsLayout
      disableBack
      setStep={setStep}
      currentStep={step || 0}
      steps={steps}
    >
      <ResetButton />
    </StepsLayout>
  );
};

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
