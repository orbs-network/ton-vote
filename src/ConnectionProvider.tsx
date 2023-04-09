import {
  isWalletInfoInjectable,
  WalletInfoInjectable,
  CHAIN,
  WalletInfo,
} from "@tonconnect/sdk";
import _ from "lodash";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TON_CONNECTOR } from "config";
import { Address } from "ton";
import { isMobile } from "react-device-detect";
import { useQuery } from "@tanstack/react-query";

type Chain = "mainnet" | "testnet" | undefined;

export interface State {
  address?: string;
  disconnect: () => void;
  connect: (wallet: any) => string | undefined;
  chain: Chain;
  walletIcon?: string;
  wallets?: WalletInfo[];
}

export const useWalletsQuery = () => {
  return useQuery(
    ["useWalletsQuery"],
    () => {
      return TON_CONNECTOR.getWallets();
    },
    {
      staleTime: Infinity,
    }
  );
};

const Context = createContext({} as State);

const ConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chain, setChain] = useState<Chain>();
  const [walletName, setWalletName] = useState<string | undefined>(undefined);
  const wallets = useWalletsQuery().data;

  useEffect(() => {
    const embeddedWallet = wallets?.find(
      (wallet) => isWalletInfoInjectable(wallet) && wallet.embedded
    ) as WalletInfoInjectable;

    if (embeddedWallet) {
      TON_CONNECTOR.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
    }
  }, [_.size(wallets)]);

  useEffect(() => {
    TON_CONNECTOR.restoreConnection();
    TON_CONNECTOR.onStatusChange((walletInfo) => {
      if (!walletInfo) {
        setChain(undefined);
        setAddress(undefined);
        setWalletName(undefined);
      } else {
        const address = walletInfo?.account.address;
        setWalletName(walletInfo.device.appName);
        setAddress(Address.parse(address).toString());
        setChain(
          walletInfo?.account.chain === CHAIN.MAINNET ? "mainnet" : "testnet"
        );
      }
    });
  }, []);

  const disconnect = useCallback(() => {
    if (TON_CONNECTOR.connected) {
      TON_CONNECTOR.disconnect();
    }
  }, []);

  const connect = useCallback((wallet: any) => {
    try {
      try {
        const walletConnectionSource = {
          jsBridgeKey: wallet.jsBridgeKey,
        };
        TON_CONNECTOR.connect(walletConnectionSource);
      } catch (error) {
        const walletConnectionSource = {
          universalLink: wallet.universalLink,
          bridgeUrl: wallet.bridgeUrl,
        };

        return TON_CONNECTOR.connect(walletConnectionSource);
      }
    } catch (error) {
      if (isMobile) {
        (window as any).location = wallet.aboutUrl;
      } else {
        window.open(wallet.aboutUrl);
      }
    }
  }, []);

  const walletIcon: any = useMemo(() => {
    return _.find(wallets, (w) => w.name === walletName)?.imageUrl;
  }, [_.size(wallets), walletName]);

  return (
    <Context.Provider
      value={{
        address,
        disconnect,
        connect,
        chain,
        walletIcon,
        wallets,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useConnection = () => useContext(Context);
export { ConnectionProvider, useConnection };
