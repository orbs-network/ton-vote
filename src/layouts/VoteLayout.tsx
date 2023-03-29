import { useTheme } from "@mui/material";
import { styled, Typography } from "@mui/material";
import { Container, Button, TxReminderPopup, ConnectButton } from "components";
import { useEffect, useRef, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import {
  APPROVE_TX,
  PROJECT_NAMES,
  TX_APPROVED_AND_PENDING,
  VOTE_OPTIONS,
  VOTE_REQUIRED_NUM_OPTIONS,
} from "config";
import { useVoteTimeline } from "hooks";
import { useConnectionStore } from "store";
import { useSendTransaction, useStateQuery } from "queries";
import _, { isNumber } from "lodash";

export function VoteLayout() {
  const [selectedVotes, setSelectedVotes] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { mutate, isLoading, txApproved } = useSendTransaction();
  const voteInProgress = useVoteTimeline()?.voteInProgress;
  const connectedAddress = useConnectionStore((store) => store.address);
  const { dataUpdatedAt: votesUpdatedDate, data } = useStateQuery();
  const [voted, setVoted] = useState(false);

  const votes = data?.votes;
  const optionsSize = _.size(selectedVotes);
  const ref = useRef(false)

  useEffect(() => {

    if (connectedAddress && !ref.current) {
      const index = votes?.findIndex((it) => it.address === connectedAddress);
      if (!isNumber(index) || index === -1) return;
      setVoted(true);
      setSelectedVotes(votes![index].vote);
      ref.current = true;
    }
  }, [connectedAddress, votesUpdatedDate, optionsSize]);

  const onSelect = (option: number) => {
    setSelectedVotes((currentVotes) => {
      const temp = [...currentVotes];
      if (temp.includes(option)) {
        temp.splice(temp.indexOf(option), 1);
      } else {
        temp.push(option);
      }
      return temp;
    });
  };

  useEffect(() => {
    setShowModal(isLoading);
  }, [isLoading]);

  const onSubmit = () => {
    mutate(_.sortBy(selectedVotes).join(","));
  };

  if (!voteInProgress) return null;
  return (
    <StyledContainer title="Please choose exactly 5 projects">
      <StyledFlexColumn>
        {VOTE_OPTIONS.map((option) => {
          const checked = selectedVotes.includes(option);
          return (
            <Option
              key={option}
              disabled={!checked && optionsSize === VOTE_REQUIRED_NUM_OPTIONS}
              checked={checked}
              option={option}
              onClick={onSelect}
            />
          );
        })}
      </StyledFlexColumn>

      <VoteButton
        voted={voted}
        selected={optionsSize}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />

      <TxReminderPopup
        text={txApproved ? TX_APPROVED_AND_PENDING : APPROVE_TX}
        open={showModal}
        close={() => setShowModal(false)}
      />
    </StyledContainer>
  );
}

const VoteButton = ({
  voted,
  onSubmit,
  isLoading,
  selected,
}: {
  onSubmit: () => void;
  isLoading: boolean;
  selected: number;
  voted: boolean;
}) => {
  const walletAddress = useConnectionStore().address;

  if (!walletAddress) {
    return <StyledConnectButton text="Connect wallet" />;
  }

  if (selected !== VOTE_REQUIRED_NUM_OPTIONS) {
    return (
      <StyledVoteButton disabled={true}>
        Selected {selected}/{VOTE_REQUIRED_NUM_OPTIONS}
      </StyledVoteButton>
    );
  }
  return (
    <StyledVoteButton onClick={onSubmit} isLoading={isLoading}>
      {voted ? "Change Vote" : "Vote"}
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

const Option = ({
  option,
  checked,
  onClick,
  disabled,
}: {
  option: number;
  checked: boolean;
  onClick: (value: number) => void;
  disabled: boolean;
}) => {
  const theme = useTheme();
  return (
    <StyledOption
      onClick={() => onClick(option)}
      style={{
        border: checked
          ? `1.5px solid ${theme.palette.primary.main}`
          : "1.5px solid rgba(114, 138, 150, 0.24)",
        opacity: disabled ? 0.65 : 1,
        pointerEvents: disabled ? "none" : "all",
      }}
    >
      <Typography>{PROJECT_NAMES[option]}</Typography>
    </StyledOption>
  );
};

const StyledOption = styled(StyledFlexRow)<{}>(({ theme }) => ({
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
  color: theme.palette.primary.main,
  p: {
    color: "inherit",
    fontWeight: 600,
    fontSize: 16,
  },
}));

const StyledContainer = styled(Container)({});
