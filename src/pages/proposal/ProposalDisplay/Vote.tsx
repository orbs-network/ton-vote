import { Fade } from "@mui/material";
import { styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Button,
  ConnectButton,
  Popup,
  TitleContainer,
} from "components";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
import { MainButton } from "@twa-dev/sdk/react";
import { isTwaApp } from "consts";
import { onConnect } from "utils";

const useChoices = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  return data?.metadata?.votingSystem.choices;
};

export function Vote() {
  const [vote, setVote] = useState<string | undefined>();
  const { mutate, isLoading } = useVote();
  const [confirmation, setConfirmation] = useState(false);
  const translations = useProposalPageTranslations();
  const { proposalAddress } = useAppParams();
  const [tgModal, setTgModal] = useState(false);

  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  const walletVote = useWalletVote(data?.votes, dataUpdatedAt);
  const currentVote = walletVote?.vote as string;
  const show = useShowComponents().vote;

  useEffect(() => {
    if (!vote) {
      setVote(walletVote?.vote as string);
    }
  }, [walletVote?.vote]);

  const onSubmit = () => {
    if (mock.isMockProposal(proposalAddress)) {
      errorToast("You can't vote on mock proposals");
    } else {
      setConfirmation(true);
    }
  };
  const walletAddress = useTonAddress();

  const onTwaClick = () => {
    if (!walletAddress) {
      onConnect();
    } else if (tgModal && !vote) {
      setTgModal(false);
    } else if (vote) {
      mutate(vote);
    } else {
      setTgModal(true);
    }
  };

  const onOptionSelect = (_vote: string) => {
    if (isTwaApp) {
      setConfirmation(true);
    }
    setVote(_vote);
  };

  const onCloseConfirmation = () => {
    setConfirmation(false);
    if (isTwaApp) {
      setVote(undefined);
    }
  };

  if (!show) return null;
  return (
    <StyledContainer title={translations.castVote}>
      <Options selected={vote} onSelect={onOptionSelect} />
      <TelegramOptionsSelect open={tgModal} onClose={() => setTgModal(false)}>
        <Options onSelect={onOptionSelect} />
      </TelegramOptionsSelect>
      <AppTooltip
        text={currentVote === vote ? `You already voted ${vote}` : ""}
      >
        <VoteButton
          isLoading={isLoading}
          disabled={!vote || isLoading || currentVote === vote}
          onSubmit={onSubmit}
          onTwaClick={onTwaClick}
        />
      </AppTooltip>
      <VoteConfirmation
        open={confirmation}
        vote={vote}
        onClose={onCloseConfirmation}
        onSubmit={() => {
          if (!vote) return;
          mutate(vote);
        }}
      />
      {isTwaApp && (
        <MainButton
          // disabled={confirmation}
          progress={isLoading}
          onClick={onTwaClick}
          text={
            !walletAddress
              ? "Connect wallet"
              : tgModal && !vote
              ? "Close"
              : confirmation
              ? "Confirm vote"
              : "Cast vote"
          }
        />
      )}
    </StyledContainer>
  );
}

const Options = ({
  onSelect,
  selected,
}: {
  onSelect: (value: string) => void;
  selected?: string;
}) => {
  const choices = useChoices();

  return (
    <StyledFlexColumn>
      {choices?.map((option) => {
        return (
          <StyledOption
            selected={option === selected}
            key={option}
            onClick={() => onSelect(option)}
          >
            <Fade in={option === selected}>
              <StyledFlexRow className="icon">
                <FiCheck style={{ width: 20, height: 20 }} />
              </StyledFlexRow>
            </Fade>
            <Typography>{option}</Typography>
          </StyledOption>
        );
      })}
    </StyledFlexColumn>
  );
};

const VoteButton = ({
  onSubmit,
  isLoading,
  disabled,
  onTwaClick,
}: {
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  onTwaClick: () => void;
}) => {
  const walletAddress = useTonAddress();

  if (!walletAddress) {
    return <StyledConnectButton />;
  }

  if (!isTwaApp) {
    return (
      <StyledVoteButton
        onClick={onSubmit}
        isLoading={isLoading}
        disabled={disabled}
      >
        Vote
      </StyledVoteButton>
    );
  }

  return null;
};

const TelegramOptionsSelect = ({
  onClose,
  open,
  children,
}: {
  onClose: () => void;
  open: boolean;
  children: ReactNode;
}) => {
  return (
    <>
      <StyledMobileSelectModal open={open} onClose={onClose}>
        <>{children}</>
      </StyledMobileSelectModal>
    </>
  );
};

const StyledMobileSelectModal = styled(Popup)({});

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
