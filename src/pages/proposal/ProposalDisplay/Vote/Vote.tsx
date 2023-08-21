import { Fade } from "@mui/material";
import { styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Button,
  ConnectButton,
  Popup,
  TitleContainer,
} from "components";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FiCheck } from "react-icons/fi";
import { useShowComponents } from "../hooks";
import { VoteConfirmation } from "./VoteConfirmation";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useTonAddress } from "@tonconnect/ui-react";
import { useVote } from "query/setters";
import { mock } from "mock/mock";
import { errorToast } from "toasts";
import _ from "lodash";
import { useAppParams, useWalletVote } from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { MainButton } from "@twa-dev/sdk/react";
import { isTwaApp } from "consts";
import { onConnect } from "utils";
import { useVoteContext, VoteContext } from "./context";

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
  const { data } = useProposalQuery(proposalAddress);
  const choices = data?.metadata?.votingSystem.choices;

  const walletVote = useWalletVote(proposalAddress);
  const lastVote = walletVote?.vote as string;
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

  if (!show) return null;
  return (
    <VoteContext.Provider
      value={{
        isLoading,
        vote,
        lastVote,
        onSubmit,
        confirmation,
        setConfirmation,
      }}
    >
      <StyledContainer title={translations.castVote}>
        <StyledFlexColumn>
          {choices?.map((option) => {
            return (
              <StyledOption
                selected={option?.toLowerCase() === vote?.toLowerCase()}
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
          text={
            !vote
              ? "Please select an option"
              : lastVote?.toLowerCase() === vote?.toLowerCase()
              ? `You already voted ${vote}`
              : ""
          }
        >
          {isTwaApp ? <TgButton /> : <RegularButton />}
        </AppTooltip>
        <VoteConfirmation
          onSubmit={() => {
            mutate(vote!);
          }}
        />
      </StyledContainer>
    </VoteContext.Provider>
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

const TgButton = () => {
  const walletAddress = useTonAddress();

  const onClick = () => {
    if (!walletAddress) {
      onConnect();
    }
  };

  const text = useMemo(() => {
    if (!walletAddress) {
      return "Connect";
    }
    return "Vote";
  }, [walletAddress]);

  return <MainButton text={text} onClick={onClick} />;
};

const RegularButton = () => {
  const { isLoading, vote, lastVote, onSubmit } = useVoteContext();
  const walletAddress = useTonAddress();

  const disabled =
    !vote || isLoading || lastVote?.toLowerCase() === vote?.toLowerCase();

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
