import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isWalletInfoInjected, WalletInfoInjected } from "@tonconnect/sdk";
import { useConnectionStore } from "store";
import {
  ChromeExtensionWalletProvider,
  TonhubProvider,
  TonWalletProvider,
} from "@ton-defi.org/ton-connection";
import { Address, Cell, CommentMessage, toNano } from "ton";
import { isMobile } from "react-device-detect";
import {
  CONTRACT_ADDRESS,
  LOCAL_STORAGE_PROVIDER,
  TX_FEE,
  walletAdapters,
} from "config";
import { WalletProvider, Provider } from "types";
import { useDataFromQueryClient } from "queries";
import { useWalletVote } from "hooks";
import TonConnect from "@tonconnect/sdk";
import _ from "lodash";

export const useWallets = () => {
  const connector = useConnectionStore().connectorTC;

  return useQuery(
    [],
    async () => {
      return  connector.getWallets();
        },
    {
      staleTime: Infinity,
    }
  );
};

export const useRestoreConnection = () => {
  const { selectWallet } = useOnWalletSelected();
  const connector = useConnectionStore().connectorTC;

  return () => {
     connector.restoreConnection();
    const provider = localStorage.getItem(LOCAL_STORAGE_PROVIDER);
    if (!provider) {
      return null
    }
    const walletAdapter = walletAdapters.find((it) => it.type === provider);
    if (walletAdapter) {
      selectWallet(walletAdapter);
    }
  };
};

export const useConnectionEvenSubscription = () => {
  const { setAddress } = useConnectionStore();
  const connector = useConnectionStore().connectorTC;
  const onConnectCallback = useOnConnectCallback();

  useEffect(() => {
    connector.onStatusChange((walletInfo) => {
      const address = walletInfo?.account.address;
      const friendlyAddress = address
        ? Address.parse(address).toFriendly()
        : "";

      if (friendlyAddress) {
        onConnectCallback(friendlyAddress);
      }
      setAddress(friendlyAddress);
    });
  }, []);
};

export const useEmbededWallet = () => {
  const wallets = useWallets().data;
  const connector = useConnectionStore().connectorTC;

  return () => {
    const embeddedWallet = wallets?.find(
      (wallet) => isWalletInfoInjected(wallet) && wallet.embedded
    ) as WalletInfoInjected;

    if (embeddedWallet) {
      connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
    }
  };
};

const useOnConnectCallback = () => {
  const { getStateData, setStateData } = useDataFromQueryClient();
  const handleWalletVote = useWalletVote();
  return (walletAddress: string) => {
    const data = getStateData();

    if (!data) return;

    data.votes = handleWalletVote(data.votes, walletAddress);
    setStateData(data);
  };
};

export const useOnWalletSelected = () => {
  const [session, setSession] = useState("");
  const { setTonConnectionProvider, setAddress } = useConnectionStore();
  const [walletInfo, setWalletInfo] = useState<
    { name: string; icon: string } | undefined
  >();
  const [showQR, setShowQR] = useState(false);
  const onConnectCallback = useOnConnectCallback();

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
    onConnectCallback(_wallet.address);
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

export const useGetTransaction = () => {
  const { connectorTC, connection } = useConnectionStore();

  return async (vote: string, onSuccess: () => void) => {
    const cell = new Cell();
    new CommentMessage(vote).writeTo(cell);

    if (connectorTC.connected) {
      handleMobileLink(connectorTC);

      await connectorTC.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: CONTRACT_ADDRESS.toFriendly(),
            amount: toNano(TX_FEE).toString(),
            stateInit: undefined,
            payload: cell ? cell.toBoc().toString("base64") : undefined,
          },
        ],
      });
      onSuccess();
      return;
    }
    if (!connection) return;

    const isExtension =
      (connection as any)._provider instanceof ChromeExtensionWalletProvider;

    if (isMobile || isExtension) {
      await connection?.requestTransaction({
        to: CONTRACT_ADDRESS,
        value: toNano(TX_FEE),
        message: cell,
      });
      onSuccess();
    } else {
      return connection?.requestTransaction(
        {
          to: CONTRACT_ADDRESS,
          value: toNano(TX_FEE),
          message: cell,
        },
        onSuccess
      );
    }
  };
};

const handleMobileLink = (connectorTC?: TonConnect) => {
  if (!isMobile) return;
  const Tonkeeper = connectorTC?.wallet?.device.appName;

  switch (Tonkeeper) {
    case "Tonkeeper":
      (window as any).location = "https://app.tonkeeper.com";
      break;

    default:
      break;
  }
};
