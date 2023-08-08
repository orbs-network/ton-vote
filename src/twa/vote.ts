// TODO: move use effect hook and functions in Vote component here

import { useTwaStore, TwaButtonType } from "store";
import { ProposalStatus } from "types";
import twa from '@twa-dev/sdk'
import { useProposalStatus } from "hooks/hooks";
import { useCallback, useEffect } from "react";
import { PopupButton } from "@twa-dev/types";

function generatePopupButtons(choices: string[] | undefined): PopupButton[] {
  if (!choices) {
    return []
  }

  return choices.map((choice) => {
    return {
      id: choice,
      text: choice,
      type: 'default'
    }
  })
}

type UseTwaVoteProps = {
  proposalAddress: string
  vote: string | undefined
  setVote: (vote: string | undefined) => void
  confirmVote: () => void
  choices: string[] | undefined
}

export function useTwaVote({proposalAddress, vote, setVote, confirmVote, choices}: UseTwaVoteProps) {

  const { proposalStatus } = useProposalStatus(proposalAddress);
  const { twaButtonType, setMainButton, hideMainButton } = useTwaStore()

  const twaVoteButtonHandler = useCallback(() => {
    twa.showPopup({
      message: 'Please choose your vote',
      buttons: generatePopupButtons(choices),
    })
  }, [choices])

  const twaOnVote = useCallback((event: {
    button_id: string | null;
  }) => {

    const matchedChoice = choices?.find((buttonId) => buttonId === event.button_id)

    if (!matchedChoice) {
      return
    }

    setVote(matchedChoice)
    hideMainButton({
      clickHandler: twaVoteButtonHandler,
    })
    twa.offEvent("popupClosed", twaOnVote)

    // Confirm vote
    setMainButton({
      clickHandler: confirmVote,
      text: `Confirm Vote: ${matchedChoice}`,
      twaButtonType: TwaButtonType.ConfirmVote
    })
  }, [choices])


  useEffect(() => {
    if (proposalStatus !== ProposalStatus.ACTIVE || vote) {

      if (twaButtonType !== TwaButtonType.CastVote || !twa.MainButton.isVisible) {
        return
      }

      hideMainButton({
        clickHandler: twaVoteButtonHandler,
      })
      twa.offEvent("popupClosed", twaOnVote)

      return
    }

    if (twaButtonType === TwaButtonType.CastVote && twa.MainButton.isVisible) {
      return
    }

    setMainButton({
      clickHandler: twaVoteButtonHandler,
      text: 'Cast Vote',
      twaButtonType: TwaButtonType.CastVote
    })
    twa.onEvent("popupClosed", twaOnVote)

    return () => {
      if (twaButtonType === TwaButtonType.CastVote) {
        hideMainButton({
          clickHandler: twaVoteButtonHandler,
        })
      }
      twa.offEvent("popupClosed", twaOnVote)
    }

  }, [proposalStatus, twaButtonType])

}