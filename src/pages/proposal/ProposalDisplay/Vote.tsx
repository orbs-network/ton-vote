import { Fade } from "@mui/material";
import { styled, Typography } from "@mui/material";
import { AppTooltip, Button, ConnectButton, TitleContainer } from "components";
import { useCallback, useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FiCheck } from "react-icons/fi";
import { useShowComponents, useWalletVote } from "./hooks";
import { VoteConfirmation } from "./VoteConfirmation";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useTonAddress } from "@tonconnect/ui-react";
import { useVote } from "query/setters";
import { mock } from "mock/mock";
import { errorToast } from "toasts";
import _ from "lodash";
import { useAppParams } from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { useTwaVote } from "twa";


export function Vote() {
  const [vote, setVote] = useState<string | undefined>();
  const { mutate, isLoading } = useVote();
  const [confirmation, setConfirmation] = useState(false);
  const translations = useProposalPageTranslations();
  const { proposalAddress } = useAppParams();

  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);
  const choices = data?.metadata?.votingSystem.choices;

  const walletVote = useWalletVote(data?.votes, dataUpdatedAt);
  const currentVote = walletVote?.vote as string;
  const show = useShowComponents().vote;

  const submitVote = useCallback(() => {
    if (!vote) return;
    mutate(vote);
  }, [vote, mutate]);

  const confirmVote = useCallback(() => {
    if (mock.isMockProposal(proposalAddress)) {
      errorToast("You can't vote on mock proposals");
    } else {
      setConfirmation(true);
    }
  }, [proposalAddress, setConfirmation])

  useTwaVote({ proposalAddress, vote, choices, setVote, confirmVote })

  useEffect(() => {
    if (!vote) {
      setVote(walletVote?.vote as string);
    }
  }, [walletVote?.vote]);



  if (!show) return null;
  return (
    <StyledContainer title={translations.castVote}>
      <StyledFlexColumn>
        {choices?.map((option) => {
          return (
            <StyledOption
              selected={option === vote}
              key={option}
              onClick={() => setVote(option)}
            >
              <Fade in={option === vote}>
                <StyledFlexRow className="icon">
                  <FiCheck style={{ width: 20, height: 20 }} />
                </StyledFlexRow>
              </Fade>
              <Typography>{option}</Typography>
            </StyledOption>
          );
        })}
      </StyledFlexColumn>
      <AppTooltip
        text={currentVote === vote ? `You already voted ${vote}` : ""}
      >
        <VoteButton
          isLoading={isLoading}
          disabled={!vote || isLoading || currentVote === vote}
          onSubmit={submitVote}
        />
      </AppTooltip>
      <VoteConfirmation
        open={confirmation}
        vote={vote}
        onClose={() => setConfirmation(false)}
        onSubmit={submitVote}
      />
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
  color: theme.palette.mode === "light" ? theme.palette.primary.main : "white",
  p: {
    color: "inherit",
    fontWeight: 600,
    fontSize: 16,
  },
}));

const StyledContainer = styled(TitleContainer)({});
