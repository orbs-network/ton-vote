import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isWalletInfoInjectable, WalletInfoInjectable } from "@tonconnect/sdk";
import {
  ChromeExtensionWalletProvider,
  TonConnection,
  TonhubProvider,
  TonWalletProvider,
} from "@ton-defi.org/ton-connection";
import { Address } from "ton";
import { isMobile } from "react-device-detect";
import {
  LOCAL_STORAGE_PROVIDER,
  TX_FEE,
  walletAdapters,
} from "config";
import {
  WalletProvider,
  Provider,
} from "types";
import TonConnect from "@tonconnect/sdk";
import _ from "lodash";
import { create } from "zustand";
import { manifestUrl } from "config";

interface ConnectionStore {
  connectorTC: TonConnect;
  reset: () => void;
  address?: string;
  connection?: TonConnection;
  setAddress: (value?: string) => void;
  setTonConnectionProvider: (provider: TonWalletProvider) => void;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  address: undefined,
  connection: undefined,
  connectorTC: new TonConnect({
    manifestUrl,
  }),
  reset: () => set({ address: undefined, connection: undefined }),
  setAddress: (address) => set({ address }),
  setTonConnectionProvider: (provider) => {
    const _connection = new TonConnection();
    _connection.setProvider(provider);
    set({ connection: _connection });
  },
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
      const friendlyAddress = address
        ? Address.parse(address).toString()
        : "";
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
  const { setTonConnectionProvider, setAddress } = useConnectionStore();
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

  const selectWallet = async (wallet: WalletProvider) => {
    let tonWalletProvider: TonWalletProvider | undefined;
    setWalletInfo({ name: wallet.title, icon: wallet.icon });

    if (wallet.type === Provider.EXTENSION) {
      tonWalletProvider = new ChromeExtensionWalletProvider();
    } else if (wallet.type === Provider.TONHUB) {
      tonWalletProvider = new TonhubProvider({
        onSessionLinkReady,
        persistenceProvider: window.localStorage,
      });

      onShowQr();
    }

    if (!tonWalletProvider) {
      return;
    }
    setTonConnectionProvider(tonWalletProvider);
    const _wallet = await tonWalletProvider.connect();
    setAddress(_wallet.address);
    localStorage.setItem(LOCAL_STORAGE_PROVIDER, wallet.type);
  };

  return {
    selectWalletTC,
    session,
    selectWallet,
    reset,
    walletInfo,
    showQR,
    hideQR: () => setShowQR(false),
  };
};

export const useResetConnection = () => {
  const reset = useConnectionStore().reset;
  const connection = useConnectionStore().connection;
  const connector = useConnectionStore().connectorTC;
  return () => {
    if (connection) connection.disconnect();
    localStorage.removeItem(LOCAL_STORAGE_PROVIDER);
    if (connector.connected) {
      connector.disconnect();
    }
    reset();
  };
};

