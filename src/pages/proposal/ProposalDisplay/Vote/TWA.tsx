import { IconButton, styled, Typography } from "@mui/material";
import { Button, Popup } from "components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import _ from "lodash";
import { MainButton } from "@twa-dev/sdk/react";
import { VoteOptions, VotePreview } from "./Components";
import { useVoteContext } from "./context";
import { useConnectedWalletVotingPower } from "../hooks";
import { StyledFlexRow } from "styles";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useAppParams } from "hooks/hooks";
import { useProposalQuery } from "query/getters";

export function TWAVote() {
  const translations = useProposalPageTranslations();
  const [showOptions, setShowOptions] = useState(false);
  const walletAddress = useTonAddress();
  const [tonConnect] = useTonConnectUI();
  const {
    vote,
    setVote,
    showConfirmation,
    onShowConfirmation,
    setShowConfirmation,
    submitVote,
    submitVoteLoading,
  } = useVoteContext();
  const { data: votingPowerData, isLoading: votingPowerLoading } =
    useConnectedWalletVotingPower();

  const { proposalAddress } = useAppParams();
  const { isSuccess: proposalLoaded } = useProposalQuery(proposalAddress);

  const onSubmitClick = useCallback(() => {
    if (!walletAddress) {
      tonConnect.connectWallet();
    } else if (!showOptions) {
      setShowOptions(true);
    } else if (!showConfirmation) {
      onShowConfirmation();
    } else {
      submitVote();
    }
  }, [
    showConfirmation,
    showOptions,
    tonConnect.connectWallet,
    walletAddress,
    onShowConfirmation,
    submitVote,
  ]);

  const btnDisabled = useMemo(() => {
    if (showOptions && !vote) {
      return true;
    }
    if (votingPowerLoading || !votingPowerData?.hasVotingPower) {
      return true;
    }
  }, [showOptions, vote, votingPowerLoading, votingPowerData?.hasVotingPower]);

  const btnText = useMemo(() => {
    if (!walletAddress) {
      return "Connect wallet";
    }
    if (!showOptions) {
      return "Vote";
    }
    if (!vote) {
      return "Select vote option";
    }

    return `Vote ${vote}`;
  }, [walletAddress, vote, showConfirmation, showOptions]);
  useEffect(() => {
    if (vote) {
      onShowConfirmation();
    }
  }, [vote, onShowConfirmation]);

  const onModalClose = useCallback(() => {
    setShowOptions(false);
    setTimeout(() => {
      setVote("");
      setShowConfirmation(false);
    }, 500);
  }, [showConfirmation]);

  const onCloseConfirmation = () => {
    setVote("");
    setShowConfirmation(false);
  };

  return (
    <>
      <StyledPopup
        open={showOptions}
        onClose={onModalClose}
        title={
          showConfirmation ? (
            <StyledFlexRow>
              <StyledChangeVote onClick={onCloseConfirmation}>
                <HiOutlineArrowLeft />
              </StyledChangeVote>
              Confirm vote
            </StyledFlexRow>
          ) : (
            translations.castVote
          )
        }
      >
        <>
          {!showConfirmation ? (
            <StyledVoteOptions ignoreSelected />
          ) : (
            <VotePreview />
          )}
        </>
      </StyledPopup>
      {proposalLoaded && (
        <MainButton
          progress={votingPowerLoading || submitVoteLoading}
          disabled={btnDisabled}
          text={btnText}
          onClick={onSubmitClick}
        />
      )}
    </>
  );
}

const StyledVoteOptions = styled(VoteOptions)(({ theme }) => ({
  ".option": {
    border: `1.5px solid ${theme.palette.primary.main}`,
    height: 45,
  },
}));

const StyledChangeVote = styled("button")({
  padding: 0,
  display: "flex",
  alignItems: "center",
  border: "none",
  background: "none",
  svg: {
    width: 22,
    height: 22,
  },
});

const StyledPopup = styled(Popup)({});
