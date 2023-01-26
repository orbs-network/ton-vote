import { ClickAwayListener, Fade, styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Button, Container } from "components";
import ConnectButton from "components/ConnectButton";
import { useAccountAddress, useResetConnection } from "store/wallet-store";
import { StyledFlexRow, StyledGrid } from "styles";
import { makeElipsisAddress } from "utils";
import { IoExitOutline } from "react-icons/io5";
import { useState } from "react";
import LogoImg from 'assets/logo.svg'
export function Navbar() {
  const address = useAccountAddress();
  return (
    <StyledContainer>
      <StyledGrid>
        <StyledFlexRow justifyContent="space-between" width="100%">
          <StyledLogo onClick={() => window.scrollTo(0, 0)}>
            <img src={LogoImg} />
            <Typography>VOTE</Typography>
          </StyledLogo>
          {!address ? <ConnectButton /> : <Connected />}
        </StyledFlexRow>
      </StyledGrid>
    </StyledContainer>
  );
}

const Connected = () => {
  const address = useAccountAddress();
  const reset = useResetConnection();
  const [showDisconnect, setShowDisconnect] = useState(false);

  return (
    <StyledConnected>
      <Button className="connected-btn" onClick={() => setShowDisconnect(true)}>
        {makeElipsisAddress(address!, 8)}
      </Button>

     
        {showDisconnect && (
          <StyledConnectedMenu>
            <ClickAwayListener onClickAway={() => setShowDisconnect(false)}>
              <StyledDisconnect onClick={reset}>
                <IoExitOutline />
                <Typography>Log out</Typography>
              </StyledDisconnect>
            </ClickAwayListener>
          </StyledConnectedMenu>
        )}
    
    </StyledConnected>
  );
};

const StyledConnectedMenu = styled(Container)({
  position: "absolute",
  top: "calc(100% + 10px)",
  left: 0,
  width: "100%",
  padding: "0px",
});

const StyledDisconnect = styled(StyledFlexRow)({
  cursor: "pointer",
  padding: '10px'
});
const StyledConnected = styled(Box)({
  position: "relative",
  ".connected-btn": {
    "*": {
      fontSize: 14,
    },
  },
});

const StyledLogo = styled("button")(({ theme }) => ({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  display: "flex",
  alignItems: "flex-end",
  gap: 7,
  p: {
    fontWeight: 700,
    position: "relative",
    color: theme.palette.text.secondary,
    fontSize: 17,
    top: -3
  },
  img: {
    height: 33,
  },
}));

const StyledContainer = styled(StyledFlexRow)({
  width: "100%",
  background: "white",
  height: 70,
  position: "fixed",
  left: "50%",
  transform: "translate(-50%)",
  top: 0,
  zIndex: 10,
});
