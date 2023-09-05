import { styled } from "@mui/material";
import { Button, ConnectButton, Popup, TitleContainer } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useTonAddress } from "@tonconnect/ui-react";
import _ from "lodash";
import { useVoteContext } from "./context";
import { VoteOptions, VotePreview } from "./Components";
import { useConnectedWalletVotingPower } from "../hooks";

export function NormalVote() {
  const translations = useProposalPageTranslations();
  const { onShowConfirmation, submitVoteLoading } = useVoteContext();

  return (
    <StyledContainer title={translations.castVote}>
      <VoteOptions />
      <VoteButton
        isLoading={submitVoteLoading}
        disabled={submitVoteLoading}
        onSubmit={onShowConfirmation}
      />
      <ConfirmationModal />
    </StyledContainer>
  );
}

const VoteButton = ({
  onSubmit,
  isLoading,
  disabled,
}: {
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}) => {
  const walletAddress = useTonAddress();

  if (!walletAddress) {
    return <StyledConnectButton />;
  }

  return (
    <StyledVoteButton
      onClick={onSubmit}
      isLoading={isLoading}
      disabled={disabled}
    >
      Vote
    </StyledVoteButton>
  );
};

const StyledVoteButton = styled(Button)({
  marginTop: 20,
  width: "100%",
});

const StyledConnectButton = styled(ConnectButton)({
  marginTop: 20,
  width: "100%",
});

const StyledContainer = styled(TitleContainer)({});

const ConfirmationModal = () => {
  const translations = useProposalPageTranslations();
  const { showConfirmation, setShowConfirmation, submitVote } =
    useVoteContext();
  const { data: votingData, isLoading: votingDataLoading } =
    useConnectedWalletVotingPower();

  const onSubmit = () => {
    submitVote();
    setShowConfirmation(false);
  };

  return (
    <StyledPopup
      title={translations.castVote}
      open={showConfirmation}
      onClose={() => setShowConfirmation(false)}
    >
      <StyledFlexColumn>
        <VotePreview />
        <StyledButtons>
          <Button
            variant="transparent"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!votingData?.hasVotingPower || votingDataLoading}
            onClick={onSubmit}
          >
            {translations.confirm}
          </Button>
        </StyledButtons>
      </StyledFlexColumn>
    </StyledPopup>
  );
};

const StyledButtons = styled(StyledFlexRow)({
  marginTop: 20,
  button: {
    width: "50%",
  },
});

const StyledPopup = styled(Popup)({
  maxWidth: 400,
  padding: 0,
});
