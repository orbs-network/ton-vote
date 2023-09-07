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
import { useWebappButtonStore } from "WebApp";

export function WebappVote() {
  const translations = useProposalPageTranslations();
  const [showOptions, setShowOptions] = useState(false);

  const { setVote, showConfirmation, setShowConfirmation } = useVoteContext();

  const onModalClose = useCallback(() => {
    setShowOptions(false);
    setTimeout(() => {
      setVote("");
      setShowConfirmation(false);
    }, 500);
  }, [showConfirmation]);

  useWebappButton(showOptions, onModalClose, () => setShowOptions(true));

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
    </>
  );
}

const useWebappButton = (
  showOptions: boolean,
  onModalClose: () => void,
  setShowOptions: () => void
) => {
  const webappButton = useWebappButtonStore();

  const { vote, showConfirmation, submitVote, submitVoteLoading } =
    useVoteContext();
  const { data: votingPowerData, isLoading: votingPowerLoading } =
    useConnectedWalletVotingPower();

  useEffect(() => {
    return () => {
      webappButton.reset();
    };
  }, []);

  useEffect(() => {
    if (!showOptions) {
      webappButton.setValues({ onClick: setShowOptions });
    } else {
      webappButton.setValues({
        onClick: () => {
          submitVote();
          onModalClose();
        },
      });
    }
  }, [showConfirmation, showOptions, submitVote, onModalClose]);

  useEffect(() => {
    if (showOptions && !vote) {
      webappButton.setValues({ disabled: true });
    } else {
      webappButton.setValues({ disabled: false });
    }
  }, [showOptions, vote, votingPowerLoading, votingPowerData?.hasVotingPower]);

  useEffect(() => {
    if (submitVoteLoading) {
      webappButton.setValues({ text: "Voting..." });
    } else if (!showOptions) {
      webappButton.setValues({ text: "Vote" });
    } else if (!vote) {
      webappButton.setValues({ text: "Select vote option" });
    } else {
      webappButton.setValues({ text: `Vote ${vote}` });
    }
  }, [vote, showConfirmation, showOptions, submitVoteLoading]);
};

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
