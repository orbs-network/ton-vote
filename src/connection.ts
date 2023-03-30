import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isWalletInfoInjectable, WalletInfoInjectable } from "@tonconnect/sdk";
import { Address } from "ton";
import { isMobile } from "react-device-detect";
import TonConnect from "@tonconnect/sdk";
import _ from "lodash";
import { create } from "zustand";
import { manifestUrl } from "config";

interface ConnectionStore {
  connectorTC: TonConnect;
  reset: () => void;
  address?: string;
  setAddress: (value?: string) => void;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  address: undefined,
  connectorTC: new TonConnect({
    manifestUrl,
  }),
  reset: () => set({ address: undefined }),
  setAddress: (address) => set({ address }),
}));

export const useWallets = () => {
  const connector = useConnectionStore().connectorTC;

  return useQuery([], () => connector.getWallets(), {
    staleTime: Infinity,
  });
};

export const useRestoreConnection = () => {
  const connector = useConnectionStore().connectorTC;

  useEffect(() => {
    connector.restoreConnection();
  }, []);
};

export const useConnectionEvenSubscription = () => {
  const { setAddress } = useConnectionStore();
  const connector = useConnectionStore().connectorTC;

  useEffect(() => {
    connector.onStatusChange((walletInfo) => {
      const address = walletInfo?.account.address;
      const friendlyAddress = address ? Address.parse(address).toString() : "";
      setAddress(friendlyAddress);
    });
  }, []);
};

export const useEmbededWallet = () => {
  const wallets = useWallets().data;
  const connector = useConnectionStore().connectorTC;

  useEffect(() => {
    const embeddedWallet = wallets?.find(
      (wallet) => isWalletInfoInjectable(wallet) && wallet.embedded
    ) as WalletInfoInjectable;

    if (embeddedWallet) {
      connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
    }
  }, []);
};

export const useOnWalletSelected = () => {
  const [session, setSession] = useState("");
  const { setAddress } = useConnectionStore();
  const [walletInfo, setWalletInfo] = useState<
    { name: string; icon: string } | undefined
  >();
  const [showQR, setShowQR] = useState(false);

  const reset = () => {
    setSession("");
    setWalletInfo(undefined);
  };

  const connector = useConnectionStore().connectorTC;

  const onSessionLinkReady = (link: string) => {
    if (isMobile) {
      (window as any).location = link;
    } else {
      setSession(link);
    }
  };

  const onShowQr = () => {
    if (!isMobile) {
      setShowQR(true);
    }
  };

  const selectWalletTC = (wallet: any) => {
    setWalletInfo({ name: wallet.name, icon: wallet.imageUrl });
    try {
      try {
        const walletConnectionSource = {
          jsBridgeKey: wallet.jsBridgeKey,
        };
        connector.connect(walletConnectionSource);
      } catch (error) {
        const walletConnectionSource = {
          universalLink: wallet.universalLink,
          bridgeUrl: wallet.bridgeUrl,
        };

        const _session = connector.connect(walletConnectionSource);
        onSessionLinkReady(_session);
        onShowQr();
      }
    } catch (error) {
      if (isMobile) {
        (window as any).location = wallet.aboutUrl;
      } else {
        window.open(wallet.aboutUrl);
      }
    }
  };

  return {
    selectWalletTC,
    session,
    reset,
    walletInfo,
    showQR,
    hideQR: () => setShowQR(false),
  };
};

export const useResetConnection = () => {
  const reset = useConnectionStore().reset;
  const connectorTC = useConnectionStore().connectorTC;
  return () => {
    if (connectorTC.connected) {
      connectorTC.disconnect();
    }
    reset();
  };
};
