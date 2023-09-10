import * as React from "react";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { FaFileInvoice } from "react-icons/fa";
import { IconButton, styled, Typography } from "@mui/material";
import { useActions, useWalletDaos } from "./hooks";
import { BsFillCollectionFill } from "react-icons/bs";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { AddressDisplay, Button, Popup } from "components";
import { BasePopupProps, Dao as DaoType } from "types";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Dao } from "pages/daos/components/Dao";
import { useAppNavigation } from "router/navigation";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { Webapp, WebappButton } from "WebApp";
import { useAppSettings } from "hooks/hooks";
import { FiMoon, FiSun } from "react-icons/fi";
import { IoWallet } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { MainButton } from "@twa-dev/sdk/react";
const useMobileActions = () => {
  const { toggleTheme, isDarkMode } = useAppSettings();
  const tonAddress = useTonAddress();
  const [daosOpen, setDaosOpen] = React.useState(false);
  const [walletOpen, setwalletOpen] = React.useState(false);

  const customAction = React.useMemo(() => {
    let _actions = [];
    if (Webapp.isEnabled) {
      _actions.push({
        title: isDarkMode ? "Light mode" : "Dark mode",
        onClick: () => toggleTheme(),
        icon: isDarkMode ? FiSun : FiMoon,
      });
    }
    if (!tonAddress) return _actions;
    _actions.push({
      title: "Youre spaces",
      onClick: () => setDaosOpen(true),
      icon: BsFillCollectionFill,
    });

    if (Webapp.isEnabled) {
      _actions.push({
        title: "Connected Wallet",
        onClick: () => setwalletOpen(true),
        icon: IoWallet,
      });
    }

    return _actions;
  }, [tonAddress, toggleTheme, isDarkMode]);

  const actions = useActions(customAction);
  return {
    actions,
    daosOpen,
    setDaosOpen,
    walletOpen,
    setwalletOpen,
  };
};

export const Mobile = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
    Webapp.hapticFeedback();
  };
  const handleClose = () => setOpen(false);
  const { daosOpen, setDaosOpen, actions, walletOpen, setwalletOpen } =
    useMobileActions();

  return (
    <StyledContainer>
      <Backdrop open={open} />
      <StyledSpeedDial
        ariaLabel="SpeedDial tooltip example"
        icon={<StyledMenuSvg />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => {
          return (
            <SpeedDialAction
              key={action.title}
              title={action.title}
              icon={<action.icon />}
              tooltipTitle={
                <Typography style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                  {action.title}
                </Typography>
              }
              tooltipOpen
              onClick={() => {
                action.onClick();
                handleClose();
              }}
            />
          );
        })}
      </StyledSpeedDial>
      <DaosPopup open={daosOpen} onClose={() => setDaosOpen(false)} />
      <WalletPopup open={walletOpen} onClose={() => setwalletOpen(false)} />
    </StyledContainer>
  );
};

const StyledMenuSvg = styled(HiOutlineMenuAlt3)({
  width: 20,
  height: 20,
  color: "white",
});

const StyledSpeedDial = styled(SpeedDial)({
  ".MuiFab-root": {
    width: 40,
    height: 40,
  },
});

const DaosPopup = ({ open, onClose }: BasePopupProps) => {
  const daos = useWalletDaos();
  const { daoPage } = useAppNavigation();

  const onSelect = (dao: DaoType) => {
    daoPage.root(dao.daoAddress);
    onClose();
  };

  return (
    <Popup onClose={onClose} open={open} title="Youre spaces">
      <StyledFlexColumn>
        {daos.map((dao) => {
          return <Dao key={dao.daoAddress} dao={dao} onSelect={onSelect} />;
        })}
      </StyledFlexColumn>
    </Popup>
  );
};

const WalletPopup = ({ open, onClose }: BasePopupProps) => {
  const address = useTonAddress();
  const [tonConnectUi] = useTonConnectUI();

  return (
    <StyledWalletPopup open={open} onClose={onClose} title="Connected wallet">
      <StyledWallet>
        <AddressDisplay address={address}  />
        <StyledDisconnect onClick={() => tonConnectUi.disconnect()}>
          <MdOutlineLogout />
        </StyledDisconnect>
      </StyledWallet>
    </StyledWalletPopup>
  );
};

const StyledWalletPopup = styled(Popup)({
  minHeight: 170,
});

const StyledDisconnect  = styled(Button)({
    height: 40,
    width: 40,
    padding: 0,
})

const StyledWallet = styled(StyledFlexRow)({
  justifyContent: "space-between",
});

const StyledContainer = styled(Box)({
  position: "fixed",
  zIndex: 1000,
  right: 10,
  bottom: 10,
});
