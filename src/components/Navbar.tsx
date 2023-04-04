import {
  ClickAwayListener,
  Fade,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Popper,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import {
  Button,
  ConnectButton,
  Container,
  FadeElement,
  Github,
} from "components";
import { StyledFlexColumn, StyledFlexRow, StyledGrid } from "styles";
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
import { MdContentCopy, MdLogout } from "react-icons/md";
import useCopyToClipboard from "hooks";
import { GoSettings } from "react-icons/go";
import { showSuccessToast, showToast } from "toasts";

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
            <Wallet />
            {!mobile && <Github />}
          </StyledFlexRow>
        </StyledFlexRow>
      </StyledGrid>
    </StyledContainer>
  );
}

const Wallet = () => {
  const { address, walletIcon, disconnect } = useConnection();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const [_, copy] = useCopyToClipboard();

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!address) {
    return (
      <StyledWalletContainer>
        <ConnectButton />
      </StyledWalletContainer>
    );
  }

  return (
    <StyledWalletContainer>
      <StyledConnected onClick={handleClick}>
        <StyledFlexRow>
          {makeElipsisAddress(address!, 5)}
          <StyledSelectedWallet src={walletIcon} />
        </StyledFlexRow>
      </StyledConnected>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <StyledMenuItem onClick={() =>{
           copy(address);
           showSuccessToast("Copied to clipboard");
        }}>
          <Typography>Copy Address</Typography>
          <MdContentCopy />
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => {
            disconnect();
            handleClose();
          }}
        >
          <Typography>Logout</Typography>
          <MdLogout />
        </StyledMenuItem>
      </Menu>
    </StyledWalletContainer>
  );
};

const StyledMenuItem = styled(MenuItem)({
  gap: 20,
  justifyContent: "space-between",
});

const StyledWalletContainer = styled(Box)({
  width: 170,
  ".button": {
    width: "100%",
  },
});

const StyledConnected = styled(Button)({
  "*": {
    fontSize: 14,
  },
});

const StyledSelectedWallet = styled("img")({
  width: 25,
  height: 25,
  borderRadius: "50%",
  overflow: "hidden",
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

  const showPopup = () => {
    analytics.GA.endpointSettingsClick();
    endpointModal.setShow(true);
    handleClose();
  };

  return (
    <IconButton onClick={showPopup}>
      <GoSettings />
    </IconButton>
  );
};

