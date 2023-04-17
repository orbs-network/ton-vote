import { Box, Fade, Skeleton, styled, Typography } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Popup } from "./Popup";
import { QRCodeSVG } from "qrcode.react";
import { createContext, useContext, useMemo, useState } from "react";
import analytics from "analytics";
import { isMobile } from "react-device-detect";
import _ from "lodash";
import { useConnection } from "ConnectionProvider";
import { Img } from "./Img";
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
}

const Context = createContext({} as ContextType);

const useWallets = () => {
  const { wallets } = useConnection();
  if (!isMobile) {
    return wallets;
  }

  return _.filter(wallets, (wallet: any) => wallet.universalLink);
};

export function WalletSelect({ open, close }: Props) {
  const [sessionUrl, setSessionUrl] = useState<string | undefined>();
  const [selectedWallet, setSelectedWallet] = useState<SelectedWallet>();
  const { disconnect } = useConnection();

  const title = useMemo(() => {
    if (selectedWallet && sessionUrl) {
      return `Connect with ${selectedWallet.name}`;
    }
    return "Select wallet";
  }, [selectedWallet, sessionUrl]);

  const onPopupClose = () => {
    if (selectedWallet) {
      disconnect();
      setSelectedWallet(undefined);
      setSessionUrl(undefined);
      return;
    }
    close();
  };

  return (
    <Context.Provider
      value={{
        sessionUrl,
        setSessionUrl,
        selectedWallet,
        setSelectedWallet,
      }}
    >
      <StyledPopup open={open} onClose={onPopupClose} title={title}>
        {!sessionUrl ? <WalletList /> : <QR />}
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
    console.log(session);

    context.setSessionUrl(session);
  };

  return (
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
      <StyledWalletImg src={wallet.imageUrl} />
      <Typography className="wallet-name">{wallet.name}</Typography>
    </StyledWallet>
  );
};

const StyledWalletImg = styled(Img)({
  boxShadow: "0px 0px 25px 0px rgb(0 0 0 / 20%)",
  borderRadius: 10,
  width: 40,
  height: 40,
  objectFit: "cover",
  img: {
    width: "100%",
    height: "100%",
  },
});

const QR = () => {
  const { selectedWallet, sessionUrl } = useContext(Context);
  return (
    <StyledQrBox>
      {sessionUrl ? (
        <QRCodeSVG
          imageSettings={{
            src: selectedWallet?.icon || "",
            x: undefined,
            y: undefined,
            height: 60,
            width: 60,
            excavate: true,
          }}
          level={"M"}
          value={sessionUrl}
          size={280}
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
  gap: 0,
  width: "100%",
  padding: "0px 10px 20px 10px",
});

const StyledPopup = styled(Popup)({
  justifyContent: "center",
  maxWidth: 400,
  padding: 0,
  ".title-container-children": {
    padding: "20px 0px 0px 0px",
    marginBottom: 10,
  },
});

const StyledQrBox = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 20px 20px 20px",
});

const StyledWallet = styled(StyledFlexRow)({
  borderRadius: 10,
  height: 60,
  padding: "0px 10px",
  gap: 15,
  cursor: "pointer",
  ".wallet-name": {
    fontSize: 17,
  },
  ":hover": {
    background: "rgba(0, 136, 204, 0.07)",
  },
});
