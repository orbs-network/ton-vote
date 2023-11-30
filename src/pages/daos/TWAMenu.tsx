import { Typography, Popover, styled } from "@mui/material";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useAppSettings } from "hooks/hooks";
import React, { lazy, Suspense, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { getBorderColor } from "theme";
import { makeElipsisAddress } from "utils";
import { Webapp } from "WebApp";

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
    Webapp.hapticFeedback();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  if (!Webapp.isEnabled) return null;
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
        <StyledMenuContent>
          <ThemeToggle />
          {address && (
            <>
              <StyledSection>
                <StyledFlexColumn gap={5} alignItems="flex-start">
                  <StyledTitle>Connected wallet</StyledTitle>
                  <StyledAddress>{makeElipsisAddress(address)}</StyledAddress>
                </StyledFlexColumn>
              </StyledSection>
              <StyledDivider />
              <StyledSection
                onClick={() => {
                  tonConnect.disconnect();
                  handleClose();
                }}
              >
                <StyledLogout>Logout</StyledLogout>
                <StyledLogoutButton>
                  <Suspense>
                    <LogoutIcon />
                  </Suspense>
                </StyledLogoutButton>
              </StyledSection>
            </>
          )}
        </StyledMenuContent>
      </StyledPopover>
    </>
  );
}


const StyledSection = styled(StyledFlexRow)({
  justifyContent: "space-between",
  padding: "0px 20px",
  p: {
    fontSize: 14,
  }
});

const ThemeToggle = () => {
  const { toggleTheme, isDarkMode } = useAppSettings();

  const onClick = () => {
    toggleTheme();
    Webapp.hapticFeedback();
  }
  return (
    <StyledTheme>
      <Typography>Theme</Typography>
      <div onClick={onClick}>{isDarkMode ? <FiSun /> : <FiMoon />}</div>
    </StyledTheme>
  );
};

const StyledTheme = styled(StyledSection)({
  svg:{
    width: 20,
    height: 20,
  }
});

const StyledDivider = styled("div")(({ theme }) => ({
  width: "100%",
  height: 8,
  background: getBorderColor(theme.palette.mode),
}));

const StyledTitle = styled(Typography)({ fontSize: 14, fontWeight: 700 });
const StyledAddress = styled(Typography)({
  fontSize: 14,
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

const StyledMenuContent = styled(StyledFlexColumn)({
  minWidth: 230,
  padding: "10px 0px",
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
