import { MainButton } from "@twa-dev/sdk/react";
import { TwaMainButtonWrapper } from "./TwaMainButtonWrapper";


type TwaConfirmVoteButtonProps = {
  vote: string | undefined
  confirmVote: () => void
}

export function TwaConfirmVoteButton({ vote, confirmVote }: TwaConfirmVoteButtonProps) {

  if (!vote) {
    return null
  }

  return (
    <TwaMainButtonWrapper>
      <MainButton onClick={confirmVote} text={`Confirm Vote: ${vote}`} />
    </TwaMainButtonWrapper>
  )
}