import { PopupButton } from "@twa-dev/types"
import { useProposalStatus } from "hooks/hooks"
import { useCallback, useEffect } from "react"
import twa from '@twa-dev/sdk'
import { MainButton } from "@twa-dev/sdk/react"
import { ProposalStatus } from "types"
import { TwaMainButtonWrapper } from "./TwaMainButtonWrapper"

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


type TwaCastVoteButtonProps = {
  proposalAddress: string
  vote: string | undefined
  setVote: (vote: string | undefined) => void
  choices: string[] | undefined
}

export function TwaCastVoteButton({ proposalAddress, vote, setVote, choices }: TwaCastVoteButtonProps) {

  const { proposalStatus } = useProposalStatus(proposalAddress);

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
    twa.offEvent("popupClosed", twaOnVote)

  }, [choices])

  useEffect(() => {

    if (vote) {
      twa.offEvent("popupClosed", twaOnVote)
      return
    }

    twa.onEvent("popupClosed", twaOnVote)
    return () => {
      twa.offEvent("popupClosed", twaOnVote)
    }
  }, [twaOnVote])

  if (proposalStatus !== ProposalStatus.ACTIVE || Boolean(vote)) {
    return null
  }

  return (
    <TwaMainButtonWrapper>
      <MainButton onClick={twaVoteButtonHandler} text='Cast Vote' />
    </TwaMainButtonWrapper>
  )
}