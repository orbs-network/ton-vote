import { Box, Fade, Skeleton, styled, Typography } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Popup } from "./Popup";

import {
  useSelectedProvider,
  useConnect,
  useConnectQR,
  useResetConnection,
  useSession,
} from "store/wallet-store";
import { QRCodeSVG } from "qrcode.react";
import { ReactNode } from "react";
import { GrClose } from "react-icons/gr";
import { walletAdapters } from "config";
import { isMobile } from "react-device-detect";

interface Props {
  open: boolean;
  close: () => void;
}

export function WalletSelect({ open, close }: Props) {
  const resetConnection = useResetConnection();

  const onWalletsClose = () => {
    resetConnection();
    close();
  };

  return (
    <StyledPopup open={open}>
      <StyledContainer>
        <WalletsView close={onWalletsClose} />
        <QrConnector />
      </StyledContainer>
    </StyledPopup>
  );
}

export function QrConnector() {
  const session = useSession();
  const resetConnection = useResetConnection();
  const selectedProvider = useSelectedProvider();
  const { showQR, toggleQR } = useConnectQR();

  const onClose = () => {
    toggleQR(false);
    setTimeout(() => {
      resetConnection();
    }, 400);
  }

  return (
    <StyledQr
      show={showQR}
      title={selectedProvider ? `Connect with ${selectedProvider.title}` : ""}
      close={onClose}
    >
      <StyledQrBox>
        {session ? (
          <QRCodeSVG
            imageSettings={{
              src: selectedProvider?.icon || "",
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
    </StyledQr>
  );
}

const WalletsView = ({ close }: { close: () => void }) => {
  const { mutate: connect } = useConnect();
  const { showQR } = useConnectQR();

  return (
    <StyledWalletsSelect close={close} show={!showQR} title="Select wallet">
      <StyledWalletsList>
        {walletAdapters.map((wallet) => {
          if(wallet.mobileDisabled && isMobile) {
            return null
          }
          return (
            <StyledWallet
              justifyContent="flex-start"
              key={wallet.type}
              onClick={() => connect(wallet)}
            >
              <img src={wallet.icon} />
              <Typography>{wallet.title}</Typography>
            </StyledWallet>
          );
        })}
      </StyledWalletsList>
    </StyledWalletsSelect>
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
  img: {
    width: 30,
    height: 30,
  },
  cursor: "pointer",

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
