import { Box, Fade, Skeleton, styled, Typography } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Popup } from "./Popup";
import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useState } from "react";
import { GrClose } from "react-icons/gr";
import { walletAdapters } from "config";
import analytics from "analytics";

import {
  useOnWalletSelected,
  useResetConnection,
  useWallets,
} from "connection";
import { isMobile } from "react-device-detect";
import _ from "lodash";
interface Props {
  open: boolean;
  close: () => void;
}

const useTonConnectWallets = () => {
  const wallets = useWallets().data;

  if (!isMobile) {
    return wallets;
  }

  return _.filter(wallets, (wallet: any) => wallet.universalLink);
};

export function WalletSelect({ open, close }: Props) {
  const resetConnection = useResetConnection();
  const tonConnectWallets = useTonConnectWallets();
  
  const {
    selectWallet,
    selectWalletTC,
    session,
    reset: resetSession,
    hideQR,
    showQR,
    walletInfo,
  } = useOnWalletSelected();

  const onWalletsClose = () => {
    resetConnection();
    close();
  };

  const onQRClose = () => {
    hideQR();
    setTimeout(() => {
      resetConnection();
      resetSession();
    }, 500);
  };

  return (
    <StyledPopup open={open}>
      <StyledContainer>
        <StyledWalletsSelect
          close={onWalletsClose}
          show={!showQR}
          title="Select wallet"
        >
          <StyledWalletsList>
            {tonConnectWallets?.map((wallet: any) => {
              return (
                <StyledWallet
                  justifyContent="flex-start"
                  key={wallet.name}
                  onClick={() => {
                    analytics.GA.walletSelectedClick(wallet.name);
                    selectWalletTC(wallet);
                  }}
                >
                  <img src={wallet.imageUrl} />
                  <Typography className="wallet-name">{wallet.name}</Typography>
                </StyledWallet>
              );
            })}
            {walletAdapters?.map((wallet) => {
              if (isMobile && wallet.mobileDisabled) return null;
              return (
                <StyledWallet
                  justifyContent="flex-start"
                  key={wallet.title}
                  onClick={() => {
                    analytics.GA.walletSelectedClick(wallet.title);
                    selectWallet(wallet);
                  }}
                >
                  <img src={wallet.icon} />
                  <Typography className="wallet-name">
                    {wallet.title}
                  </Typography>
                </StyledWallet>
              );
            })}
          </StyledWalletsList>
        </StyledWalletsSelect>
        <StyledQr
          show={showQR}
          title={walletInfo ? `Connect with ${walletInfo.name}` : ""}
          close={onQRClose}
        >
          <QR session={session} icon={walletInfo?.icon} />
        </StyledQr>
      </StyledContainer>
    </StyledPopup>
  );
}

const QR = ({ session, icon = "" }: { session?: string; icon?: string }) => {
  return (
    <StyledQrBox>
      {session ? (
        <QRCodeSVG
          imageSettings={{
            src: icon,
            x: undefined,
            y: undefined,
            height: 50,
            width: 50,
            excavate: true,
          }}
          level={"M"}
          value={session}
          size={260}
        />
      ) : (
        <Skeleton
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 10,
            background: "rgba(0,0,0, 0.16)",
          }}
          variant="rectangular"
          width={210}
          height={60}
        />
      )}
    </StyledQrBox>
  );
};

const StyledWalletsList = styled(StyledFlexColumn)({
  gap: 20,
});

const StyledQrBox = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledWallet = styled(StyledFlexRow)({
  gap: 15,
  img: {
    width: 35,
    height: 35,
  },
  cursor: "pointer",
  ".wallet-name": {
    fontSize: 17,
  },
});

const StyledContainer = styled(StyledFlexColumn)({
  position: "relative",
});

const ContentWrapper = ({
  children,
  title,
  close,
  show,
  className = "",
}: {
  children: ReactNode;
  title: string;
  close: () => void;
  show: boolean;
  className?: string;
}) => {
  return (
    <Fade in={show}>
      <StyledStyledContentWrapper className={className}>
        <StyledFlexRow
          justifyContent="space-between"
          style={{ marginBottom: 20 }}
        >
          <Typography className="title" variant="h4">
            {title}
          </Typography>
          <StyledClose onClick={close}>
            <GrClose style={{ width: 18, height: 18 }} />
          </StyledClose>
        </StyledFlexRow>
        {children}
      </StyledStyledContentWrapper>
    </Fade>
  );
};

const StyledClose = styled("button")({
  background: "transparent",
  border: "unset",
  margin: 0,
  padding: 0,
  cursor: "pointer",
});

const StyledStyledContentWrapper = styled(StyledFlexColumn)({
  gap: 0,
  background: "white",
  borderRadius: 10,
  padding: "14px 20px 20px 20px",
  position: "relative",
  width: "calc(100vw - 50px)",
  justifyContent: "flex-start",
  ".title": {
    fontSize: 18,
  },
});

const StyledPopup = styled(Popup)({
  ".children": {
    background: "transparent",
    boxShadow: "unset",
  },
});

const StyledQr = styled(ContentWrapper)({
  position: "absolute",
  maxWidth: 340,
  height: 360,
});

const StyledWalletsSelect = styled(ContentWrapper)({
  maxWidth: 350,
});
