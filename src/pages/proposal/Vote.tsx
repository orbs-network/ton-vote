import { Fade } from "@mui/material";
import { styled, Typography } from "@mui/material";
import { Container, Button, TxReminderPopup, ConnectButton } from "components";
import { useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FiCheck } from "react-icons/fi";
import { APPROVE_TX, TX_APPROVED_AND_PENDING, voteOptions } from "config";
import { useVoteStore } from "./store";
import { useConnectionStore } from "connection";
import { ProposalStatus } from "types";
import { useProposalStatusQuery } from "query/queries";
import { useProposalAddress } from "hooks";
import { useVote } from "query/mutations";

export function Vote() {
  const { vote, setVote } = useVoteStore();
  const [showModal, setShowModal] = useState(false);
  const { mutate, isLoading } = useVote();
  const proposalAddress = useProposalAddress()
  const proposalStatus = useProposalStatusQuery(proposalAddress);

  useEffect(() => {
    setShowModal(isLoading);
  }, [isLoading]);

  const onSubmit = () => {
    if (!vote) return;
    mutate();
  };

  if (proposalStatus !== ProposalStatus.PENDING) return null;

  return (
    <StyledContainer title="Should the validators proceed with this proposal?">
      <StyledFlexColumn>
        {voteOptions.map((option) => {
          return (
            <StyledOption
              selected={option.value === vote}
              key={option.value}
              onClick={() => setVote(option.value)}
            >
              <Fade in={option.value === vote}>
                <StyledFlexRow className="icon">
                  <FiCheck style={{ width: 20, height: 20 }} />
                </StyledFlexRow>
              </Fade>
              <Typography>{option.name}</Typography>
            </StyledOption>
          );
        })}
      </StyledFlexColumn>
      <VoteButton
        isLoading={isLoading}
        disabled={!vote || isLoading}
        onSubmit={onSubmit}
      />

      <TxReminderPopup
        text={TX_APPROVED_AND_PENDING}
        open={showModal}
        close={() => setShowModal(false)}
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
  const walletAddress = useConnectionStore().address;

  if (!walletAddress) {
    return <StyledConnectButton text="Connect wallet" />;
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
  color: theme.palette.primary.main,
  p: {
    color: "inherit",
    fontWeight: 600,
    fontSize: 16,
  },
}));

const StyledContainer = styled(Container)({});
