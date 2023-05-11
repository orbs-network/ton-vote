import {
  Chip,
  IconButton,
  MenuItem,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import { AppSocials, Button, ConnectButton, Github, Menu } from "components";
import { StyledFlexColumn, StyledFlexRow, StyledGrid } from "styles";
import { makeElipsisAddress } from "utils";
import { useState } from "react";
import { useAppNavigation } from "router/navigation";
import { useConnection } from "ConnectionProvider";
import { MdContentCopy, MdLogout } from "react-icons/md";
import { useCopyToClipboard, useDevFeatures } from "hooks";
import { APP_NAME, releaseMode, LANGUAGES } from "config";
import { useTranslation } from "react-i18next";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { BsGlobeAmericas } from "react-icons/bs";
import _ from "lodash";
import LogoImg from "assets/logo.png";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { ReleaseMode } from "ton-vote-contracts-sdk";

export function Navbar() {
  const mobile = useMediaQuery("(max-width:600px)");
  const { daosPage } = useAppNavigation();
  const devFeatures = useDevFeatures()
  return (
    <StyledContainer>
      <StyledNav>
        <StyledLogo onClick={daosPage.root}>
          <img src={LogoImg} />
          <Typography style={{ marginTop: 5 }}>{APP_NAME}</Typography>
        </StyledLogo>
        <StyledFlexRow style={{ width: "fit-content" }}>
          {devFeatures && <Chip label="Dev mode" />}
          <Wallet />

          {!mobile && <Github />}
        </StyledFlexRow>
      </StyledNav>
    </StyledContainer>
  );
}

const Wallet = () => {
  const { address, disconnect } = useConnection();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
 const translations = useCommonTranslations()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

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
          <Typography style={{ flex: 1 }}>
            {makeElipsisAddress(address!, 5)}
          </Typography>
          {/* <StyledSelectedWallet src={walletIcon} /> */}
        </StyledFlexRow>
      </StyledConnected>

      <Menu anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
        <StyledMenuItem onClick={() => copy(address)}>
          <Typography>{translations.copyAddress}</Typography>
          <MdContentCopy />
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => {
            disconnect();
            handleClose();
          }}
        >
          <Typography>{translations.logout}</Typography>
          <MdLogout />
        </StyledMenuItem>
      </Menu>
    </StyledWalletContainer>
  );
};

const SideMenu = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <StyledDotsButton onClick={handleClick}>
        <HiOutlineDotsHorizontal />
      </StyledDotsButton>
      <Menu anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
        <StyledMenuContent>
          <LanuageSelect />
          <StyledSocials>
            <AppSocials />
          </StyledSocials>
        </StyledMenuContent>
      </Menu>
    </>
  );
};

const StyledSocials = styled(Box)({
  width: "100%",
  borderTop: "1px solid #E0E0E0",
  marginTop: 40,
  paddingTop: 20,
});

const StyledMenuContent = styled(StyledFlexColumn)({
  padding: "20px 0px 10px 0px",
  minWidth: 200,
  gap: 0,
});

const StyledDotsButton = styled(Button)({
  width: "unset",
  height: "unset",
  borderRadius: "50%",
  padding: 10,
});

const LanuageSelect = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { i18n } = useTranslation();

  const currentLanguage =
    LANGUAGES[i18n.language as keyof typeof LANGUAGES] || LANGUAGES.en;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  return (
    <>
      <StyledLanguageSelectButton onClick={handleClick} variant="transparent">
        <StyledFlexRow>
          <BsGlobeAmericas />
          <Typography>{currentLanguage}</Typography>
        </StyledFlexRow>
      </StyledLanguageSelectButton>
      <Menu anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
        <StyledLanguages>
          {_.map(LANGUAGES, (value, key) => {
            return (
              <MenuItem
                onClick={() => {
                  i18n.changeLanguage(key);
                  setAnchorEl(null);
                }}
                selected={currentLanguage === value}
                key={key}
              >
                {value}
              </MenuItem>
            );
          })}
        </StyledLanguages>
      </Menu>
    </>
  );
};

const StyledLanguages = styled(Box)({
  width: "100%",
});

const StyledLanguageSelectButton = styled(Button)({
  height: "unset",
  padding: "10px 20px",
  "*": { fontSize: 14 },
  svg: {
    width: 17,
    height: 17,
  },
});

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

const StyledLogo = styled("button")(({ theme }) => ({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  margin: 0,
  padding: 0,
  gap: 10,
  p: {
    fontWeight: 800,
    position: "relative",
    color: theme.palette.text.secondary,
    fontSize: 20,
    top: -3,
  },
  img: {
    height: 40,
  },
}));

const StyledContainer = styled(StyledFlexRow)({
  background: "white",
  height: 70,
  position: "fixed",
  left: "50%",
  transform: "translate(-50%)",
  top: 0,
  zIndex: 20,
  borderBottom: "0.5px solid rgba(114, 138, 150, 0.24)",
});

const StyledNav = styled(StyledGrid)({
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "row",
});
