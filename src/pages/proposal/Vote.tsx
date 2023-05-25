import { Fade } from "@mui/material";
import { styled, Typography } from "@mui/material";
import { Button, ConnectButton, TitleContainer } from "components";
import { useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FiCheck } from "react-icons/fi";
import { ProposalStatus } from "types";
import { useProposalPageStatus } from "./hooks";
import { VoteConfirmation } from "./VoteConfirmation";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useTonAddress } from "@tonconnect/ui-react";
import { useVote } from "query/setters";
import { useProposalPageQuery } from "query/getters";
import { mock } from "mock/mock";
import { useProposalAddress } from "hooks";
import { errorToast } from "toasts";

export function Vote() {
  const [vote, setVote] = useState<string | undefined>();
  const { mutate, isLoading } = useVote();
  const [confirmation, setConfirmation] = useState(false);
  const proposalStatus = useProposalPageStatus();
  const translations = useProposalPageTranslations();
  const choices = useProposalPageQuery().data?.metadata?.votingSystem.choices;
  const proposalAddress = useProposalAddress();

  const onSubmit = () => {
    if (mock.isMockProposal(proposalAddress)) {
      errorToast("You can't vote on mock proposals")
    } else {
      setConfirmation(true);
    }
  };

  return (
    <>
      <StyledContainer title={translations.castVote}>
        <StyledFlexColumn>
          {choices?.map((option) => {
            return (
              <StyledOption
                selected={option.toLowerCase() === vote}
                key={option}
                onClick={() => setVote(option.toLowerCase())}
              >
                <Fade in={option.toLowerCase() === vote}>
                  <StyledFlexRow className="icon">
                    <FiCheck style={{ width: 20, height: 20 }} />
                  </StyledFlexRow>
                </Fade>
                <Typography>{option}</Typography>
              </StyledOption>
            );
          })}
        </StyledFlexColumn>
        {proposalStatus === ProposalStatus.ACTIVE && (
          <>
            <VoteButton
              isLoading={isLoading}
              disabled={!vote || isLoading}
              onSubmit={onSubmit}
            />
            <VoteConfirmation
              open={confirmation}
              vote={vote}
              onClose={() => setConfirmation(false)}
              onSubmit={() => mutate(vote!)}
            />
          </>
        )}
      </StyledContainer>
    </>
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

const StyledOption = styled(StyledFlexRow)<{
  selected?: boolean;
}>(({ theme, selected }) => ({
  transition: "0.2s all",
  width: "100%",
  borderRadius: 30,
  height: 40,
  cursor: "pointer",
  position: "relative",
  ".icon": {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: "translate(0, -50%)",
    width: "fit-content",
  },
  border: selected
    ? `1.5px solid ${theme.palette.primary.main}`
    : "1.5px solid rgba(114, 138, 150, 0.24)",
  color: theme.palette.mode === 'light' ?  theme.palette.primary.main : 'white',
  p: {
    color: "inherit",
    fontWeight: 600,
    fontSize: 16,
  },
}));

const StyledContainer = styled(TitleContainer)({});
