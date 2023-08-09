import { MainButton } from "@twa-dev/sdk/react";
import { TwaMainButtonWrapper } from "./TwaMainButtonWrapper";


type TwaConfirmVoteButtonProps = {
  currentVote: string | undefined
  vote: string | undefined
  confirmVote: () => void
  isLoading: boolean
}

export function TwaConfirmVoteButton({ vote, confirmVote, isLoading, currentVote }: TwaConfirmVoteButtonProps) {

  if (!vote) {
    return null
  }

  if (currentVote === vote) {
    return (
      <TwaMainButtonWrapper>
        <MainButton onClick={() => { }} text={`You voted: ${currentVote}`} disabled />
      </TwaMainButtonWrapper>
    )
  }

  return (
    <TwaMainButtonWrapper>
      <MainButton onClick={confirmVote} text={`Confirm Vote: ${vote}`} progress={isLoading} />
    </TwaMainButtonWrapper>
  )
}