import { Typography, IconButton, Popover, styled } from "@mui/material";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import React, { lazy, Suspense, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { getBorderColor } from "theme";
import { makeElipsisAddress } from "utils";

const SettingsIcon = lazy(() =>
  import("react-icons/io5").then(({ IoSettingsOutline }) => ({
    default: IoSettingsOutline,
  }))
);

const LogoutIcon = lazy(() =>
  import("react-icons/md").then(({ MdOutlineLogout }) => ({
    default: MdOutlineLogout,
  }))
);

export function TWAMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const address = useTonAddress();
    const [tonConnect] = useTonConnectUI();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  if (!address) return null;
    return (
      <>
        <StyledMenuButton onClick={handleClick}>
          <Suspense>
            <SettingsIcon />
          </Suspense>
        </StyledMenuButton>
        <StyledPopover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <StyledTWAMenu>
            <StyledTop>
              <StyledTitle>Connected wallet</StyledTitle>
              <StyledAddress>{makeElipsisAddress(address)}</StyledAddress>
            </StyledTop>
            <StyledDivider />
            <StyledBottom>
              <StyledLogout>Logout</StyledLogout>
              <StyledLogoutButton onClick={() => tonConnect.disconnect()}>
                <Suspense>
                  <LogoutIcon />
                </Suspense>
              </StyledLogoutButton>
            </StyledBottom>
          </StyledTWAMenu>
        </StyledPopover>
      </>
    );
}

const StyledTop = styled(StyledFlexColumn)({
    padding:'0px 20px',
    alignItems: "flex-start",
})

const StyledBottom = styled(StyledFlexRow)({
  justifyContent: "space-between",
  padding: "0px 20px",
});

const StyledDivider = styled("div")(({theme}) => ({
  width: "100%",
  height: 8,
  background: getBorderColor(theme.palette.mode),
}));

const StyledTitle = styled(Typography)({ fontSize: 14, fontWeight: 700 });
const StyledAddress = styled(Typography)({
    fontSize: 14
});
const StyledLogout = styled(Typography)({
  fontSize: 14,
  color: "#FF3233",
});
const StyledLogoutButton = styled("div")({
  cursor: "pointer",
  svg: {
    width: 20,
    height: 20,
  },
  "*": {
    color: "#FF3233",
  },
});
const StyledTWAMenu = styled(StyledFlexColumn)({
    minWidth: 230,
    padding:'10px 0px',
  "*": {
    alignItems: "flex-start",
  },
});

const StyledPopover = styled(Popover)({
  ".MuiPaper-root": {
    borderRadius: 10,
  },
});

const StyledMenuButton = styled("button")({
    background: "transparent",
    border: "none",
    cursor: "pointer",
  padding: 0,
  svg: {
    width: 25,
    height: 25,
  },

});
