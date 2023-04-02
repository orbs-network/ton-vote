import {
  IconButton,
  Menu,
  MenuItem,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import { Button, ConnectButton, Github } from "components";
import { StyledFlexRow, StyledGrid } from "styles";
import { makeElipsisAddress } from "utils";
import { useState } from "react";
import LogoImg from "assets/logo.svg";
import { FiSettings } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import { RiRouteFill } from "react-icons/ri";
import { useEnpointModal } from "store";
import analytics from "analytics";
import { useAppNavigation } from "router";
import { useConnection } from "ConnectionProvider";

export function Navbar() {
  const mobile = useMediaQuery("(max-width:600px)");
  const { daosPage } = useAppNavigation();
  return (
    <StyledContainer>
      <StyledGrid>
        <StyledFlexRow justifyContent="space-between" width="100%">
          <StyledLogo onClick={daosPage.root}>
            <img src={LogoImg} />
            <Typography>VOTE</Typography>
          </StyledLogo>
          <StyledFlexRow style={{ width: "fit-content" }}>
            <Settings />
            <ConnectSection />
            {!mobile && <Github />}
          </StyledFlexRow>
        </StyledFlexRow>
      </StyledGrid>
    </StyledContainer>
  );
}

const ConnectSection = () => {
  const { address, walletIcon } = useConnection();

  if (!address) {
    return <ConnectButton />;
  }

  return (
    <StyledConnected>
      <StyledFlexRow>
        {makeElipsisAddress(address!, 6)}
        <StyledSelectedWallet>
          <img src={walletIcon} />
        </StyledSelectedWallet>
      </StyledFlexRow>
    </StyledConnected>
  );
};

const StyledSelectedWallet = styled(Box)({
  width: 25,
  height: 25,
  borderRadius: "50%",
  overflow: "hidden",
  img: {
    width: "100%",
    height: "100%",
  },
});

const StyledConnected = styled(Button)({
  pointerEvents: "none",
  "*": {
    fontSize: 14,
  },
});

const StyledLogo = styled("button")(({ theme }) => ({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  display: "flex",
  alignItems: "flex-end",
  margin: 0,
  padding: 0,
  gap: 7,
  p: {
    fontWeight: 700,
    position: "relative",
    color: theme.palette.text.secondary,
    fontSize: 17,
    top: -3,
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

/// setings component

const Settings = () => {
  const { address, disconnect } = useConnection();
  const endpointModal = useEnpointModal();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const logout = () => {
    disconnect();
    handleClose();
  };

  const showPopup = () => {
    analytics.GA.endpointSettingsClick();
    endpointModal.setShow(true);
    handleClose();
  };

  return (
    <StyledSettings>
      <IconButton onClick={handleClick}>
        <FiSettings />
      </IconButton>
      <StyledMenu
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={showPopup}>
          <StyledMenuItemContent>
            <RiRouteFill />
            <Typography>RPC endpoint</Typography>
          </StyledMenuItemContent>
        </MenuItem>
        {address && (
          <MenuItem onClick={logout}>
            <StyledMenuItemContent>
              <IoLogOutOutline />
              <Typography>Logout</Typography>
            </StyledMenuItemContent>
          </MenuItem>
        )}
      </StyledMenu>
    </StyledSettings>
  );
};

const StyledMenu = styled(Menu)({
  ".MuiPaper-root": {
    borderRadius: 10,
  },
});

const StyledMenuItemContent = styled(StyledFlexRow)({
  justifyContent: "flex-start",
});

const StyledSettings = styled(Box)({});
