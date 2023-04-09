import { Box, Fade, Skeleton, styled, Typography } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Popup } from "./Popup";
import { QRCodeSVG } from "qrcode.react";
import { createContext, ReactNode, useContext, useState } from "react";
import { GrClose } from "react-icons/gr";
import analytics from "analytics";
import { isMobile } from "react-device-detect";
import _ from "lodash";
import { useConnection } from "ConnectionProvider";
interface Props {
  open: boolean;
  close: () => void;
}

interface SelectedWallet {
  name: string;
  icon: string;
}

interface ContextType {
  sessionUrl?: string;
  setSessionUrl: (url: string | undefined) => void;
  selectedWallet: SelectedWallet | undefined;
  setSelectedWallet: (wallet?: SelectedWallet) => void;
  close: () => void;
}

const Context = createContext({} as ContextType);

const useWallets = () => {
  const {wallets} = useConnection()
  if (!isMobile) {
    return wallets;
  }

  return _.filter(wallets, (wallet: any) => wallet.universalLink);
};

export function WalletSelect({ open, close }: Props) {
  const [sessionUrl, setSessionUrl] = useState<string | undefined>();
  const [selectedWallet, setSelectedWallet] = useState<SelectedWallet>();

  return (
    <Context.Provider
      value={{
        sessionUrl,
        setSessionUrl,
        selectedWallet,
        setSelectedWallet,
        close,
      }}
    >
      <StyledPopup open={open}>
        <StyledContainer>
          <WalletList />
          <QR />
        </StyledContainer>
      </StyledPopup>
    </Context.Provider>
  );
}

const WalletList = () => {
  const { connect } = useConnection();
  const wallets = useWallets();

  const context = useContext(Context);
  const onConnect = (wallet: any) => {
    context.setSessionUrl(undefined);
    analytics.GA.walletSelectedClick(wallet.name);
    context.setSelectedWallet({ name: wallet.name, icon: wallet.imageUrl });
    const session = connect(wallet);
    context.setSessionUrl(session);
  };

  return (
    <StyledWalletsSelect
      close={context.close}
      show={!context.sessionUrl}
      title="Select wallet"
    >
      <StyledWalletsList>
        {wallets?.map((wallet: any) => {
          return (
            <Wallet
              key={wallet.name}
              wallet={wallet}
              onConnect={() => onConnect(wallet)}
            />
          );
        })}
      </StyledWalletsList>
    </StyledWalletsSelect>
  );
};

const Wallet = ({
  wallet,
  onConnect,
}: {
  wallet: any;
  onConnect: () => void;
}) => {
  return (
    <StyledWallet
      justifyContent="flex-start"
      key={wallet.name}
      onClick={onConnect}
    >
      <img src={wallet.imageUrl} />
      <Typography className="wallet-name">{wallet.name}</Typography>
    </StyledWallet>
  );
};

const QR = () => {
  const { selectedWallet, sessionUrl, setSessionUrl } = useContext(Context);

  const onClose = () => {
    setSessionUrl(undefined);
  };

  return (
    <StyledQr
      show={!!sessionUrl}
      title={selectedWallet ? `Connect with ${selectedWallet.name}` : ""}
      close={onClose}
    >
      <StyledQrBox>
        {sessionUrl ? (
          <QRCodeSVG
            imageSettings={{
              src: selectedWallet?.icon || "",
              x: undefined,
              y: undefined,
              height: 50,
              width: 50,
              excavate: true,
            }}
            level={"M"}
            value={sessionUrl}
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
