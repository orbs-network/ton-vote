import { Fade, Theme } from "@mui/material";
import { styled, Typography, useTheme } from "@mui/material";
import { Container, Button, TxOverlay, TxReminderPopup } from "components";
import { useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FiCheck } from "react-icons/fi";
import { useSendTransaction } from "queries";
const voteOptions = [
  {
    name: "Yes",
    value: "yes",
  },
  {
    name: "No",
    value: "no",
  },
  {
    name: "Abstain",
    value: "abstain",
  },
];

export function VoteLayout() {
  const [selected, setSelected] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { mutate, isLoading } = useSendTransaction();

  useEffect(() => {
    setShowModal(isLoading);
  }, [isLoading]);

  const onSelect = (value: string) => {
    setSelected(value);
  };

  return (
    <StyledContainer title="Vote">
      <StyledFlexColumn>
        {voteOptions.map((option) => {
          return (
            <StyledOption
              selected={option.value === selected}
              key={option.value}
              onClick={() => onSelect(option.value)}
            >
              <Fade in={option.value === selected}>
                <StyledFlexRow className="icon">
                  <FiCheck style={{ width: 20, height: 20 }} />
                </StyledFlexRow>
              </Fade>
              <Typography>{option.name}</Typography>
            </StyledOption>
          );
        })}
      </StyledFlexColumn>
      <StyledVoteButton
        onClick={() => mutate({ value: selected as any })}
        isLoading={isLoading}
        disabled={!selected || isLoading}
      >
        Vote
      </StyledVoteButton>
      <TxReminderPopup open={showModal} close={() => setShowModal(false)} />
    </StyledContainer>
  );
}
const StyledVoteButton = styled(Button)({
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
