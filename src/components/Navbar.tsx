import {
  Menu,
  MenuItem,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import {
  Button,
  ConnectButton,
  Github,
} from "components";
import {StyledFlexRow, StyledGrid } from "styles";
import { makeElipsisAddress } from "utils";
import { useState } from "react";
import LogoImg from "assets/logo.svg";
import { useAppNavigation } from "router";
import { useConnection } from "ConnectionProvider";
import { MdContentCopy, MdLogout } from "react-icons/md";
import { useCopyToClipboard } from "hooks";
import { showSuccessToast } from "toasts";

export function Navbar() {
  const mobile = useMediaQuery("(max-width:600px)");
  const { daosPage } = useAppNavigation();
  return (
    <StyledContainer>
      <StyledNav>
        <StyledLogo onClick={daosPage.root}>
          <Typography>VOTE</Typography>
        </StyledLogo>
        <StyledFlexRow style={{ width: "fit-content" }}>
          <Wallet />
          {!mobile && <Github />}
        </StyledFlexRow>
      </StyledNav>
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
          <Typography style={{flex:1}}>{makeElipsisAddress(address!, 5)}</Typography>
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
        <StyledMenuItem
          onClick={() => {
            copy(address);
            showSuccessToast("Copied to clipboard");
          }}
        >
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
  minWidth: 25,
  minHeight: 25,
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
  background: "white",
  height: 70,
  position: "fixed",
  left: "50%",
  transform: "translate(-50%)",
  top: 0,
  zIndex: 10,
  borderBottom: "0.5px solid rgba(114, 138, 150, 0.24)",
});





const StyledNav = styled(StyledGrid)({
  display:'flex',
  justifyContent:'space-between',
  flexDirection:'row'
});