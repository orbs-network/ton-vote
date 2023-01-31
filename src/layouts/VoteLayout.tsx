import { Fade } from "@mui/material";
import { styled, Typography } from "@mui/material";
import { Container, Button, TxReminderPopup, ConnectButton } from "components";
import { useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FiCheck } from "react-icons/fi";
import { useDataQuery, useSendTransaction } from "queries";
import { useWalletAddress } from "store/wallet-store";
import { APPROVE_TX, TX_APPROVED_AND_PENDING, voteOptions } from "config";

export const useSelection = () => {
  const [selected, setSelected] = useState("");
  const walletAddress = useWalletAddress();
  const votes = useDataQuery().data?.votes;

  const votesLength = votes?.length;

  useEffect(() => {
    if (votesLength && walletAddress && !selected) {   
      const vote = voteOptions.find((it) => it.name === votes[0].vote); 
      setSelected(vote?.value || '');
    }
  }, [votesLength, walletAddress]);

  return { selected, setSelected };
};

export function VoteLayout() {
  const { selected, setSelected } = useSelection();
  const [showModal, setShowModal] = useState(false);
  const { mutate, isLoading, txApproved } = useSendTransaction();
  const walletAddress = useWalletAddress();

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

      {walletAddress ? (
        <StyledVoteButton
          onClick={() =>
            mutate({
              value: selected as any,
            })
          }
          isLoading={isLoading}
          disabled={!selected || isLoading}
        >
          Vote
        </StyledVoteButton>
      ) : (
        <StyledConnectButton text="Vote" />
      )}
      <TxReminderPopup
        text={txApproved ? TX_APPROVED_AND_PENDING : APPROVE_TX}
        open={showModal}
        close={() => setShowModal(false)}
      />
    </StyledContainer>
  );
}
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
