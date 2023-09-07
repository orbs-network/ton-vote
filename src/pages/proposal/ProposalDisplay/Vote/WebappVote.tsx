import { IconButton, styled, Typography } from "@mui/material";
import { Button, Popup } from "components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import _ from "lodash";
import { VoteOptions, VotePreview } from "./Components";
import { useVoteContext } from "./context";
import { useConnectedWalletVotingPower } from "../hooks";
import { StyledFlexRow } from "styles";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { WebappButton } from "WebApp";

export function WebappVote() {
  const translations = useProposalPageTranslations();
  const [showOptions, setShowOptions] = useState(false);
  const { data: votingPowerData, isLoading: votingPowerLoading } =
    useConnectedWalletVotingPower();

  const {
    setVote,
    showConfirmation,
    setShowConfirmation,
    submitVoteLoading,
    lastVote,
    vote,
    submitVote,
    onShowConfirmation,
  } = useVoteContext();

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

  const text = useMemo(() => {
    if (submitVoteLoading) {
      return "Voting...";
    } else if (!showOptions) {
      return !!lastVote ? "Vote again" : "Vote";
    } else if (!vote) {
      return "Select an option";
    }
    else if(showConfirmation) {
      return "Confirm vote";
    }
    else {
      return `Select`;
    }
  }, [vote, showConfirmation, showOptions, submitVoteLoading, lastVote]);

  const onWebappButtonClick = useCallback(() => {
    if (!showOptions) {
      setShowOptions(true);
    } else if (!showConfirmation) {
      onShowConfirmation();
    } else {
      submitVote();
      onModalClose();
    }
  }, [
    showConfirmation,
    showOptions,
    submitVote,
    onModalClose,
    onShowConfirmation,
  ]);

  const webappButtonProgress = useMemo(() => {
    if (submitVoteLoading || votingPowerLoading) {
      return true;
    }
    return false;
  }, [submitVoteLoading, votingPowerLoading]);

  const webappButtonDisabled = useMemo(() => {
    if (showOptions && !vote) {
      return true;
    }
    return false;
  }, [showOptions, vote]);

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
        <>{!showConfirmation ? <StyledVoteOptions /> : <VotePreview />}</>
      </StyledPopup>
      <WebappButton
        disabled={webappButtonDisabled}
        progress={webappButtonProgress}
        onClick={onWebappButtonClick}
        text={text}
      />
    </>
  );
}

const StyledVoteOptions = styled(VoteOptions)(({ theme }) => ({
  ".option": {
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

const StyledPopup = styled(Popup)({
  minHeight: "50vh",
});
