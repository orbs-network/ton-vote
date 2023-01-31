import { create } from "zustand";
import {
  TonConnection,
  TonhubProvider,
  TonkeeperProvider,
  TonWalletProvider,
  ChromeExtensionWalletProvider,
} from "@ton-defi.org/ton-connection";
import { Provider, WalletProvider } from "types";
import { useMutation } from "@tanstack/react-query";
import { walletAdapters } from "config";
import { isMobile } from "react-device-detect";
import { useSortVotesAfterConnect } from "queries";
import { useState } from "react";

const LOCAL_STORAGE_PROVIDER = "ton_vote_wallet_provider";
interface AccountStore {
  address?: string;
  setAddress: (value: string) => void;
  setTonConnectionProvider: (provider: TonWalletProvider) => void;
  connection?: TonConnection;
  reset: () => void;
}

const defultAcccountState = {
  address: undefined,
  connection: undefined,
};

export const useWalletStore = create<AccountStore>((set, get) => ({
  reset: () => set(defultAcccountState),
  ...defultAcccountState,
  setAddress: (address) => set({ address }),
  setTonConnectionProvider: (provider) => {
    const _connection = new TonConnection()
    _connection.setProvider(provider);
    set({ connection: _connection });
  },
}));

export const useConnection = () => {
  return useWalletStore(store => store.connection)
}

export const useWalletAddress = () => {
  return useWalletStore((store) => store.address);
};

export const useConnect = () => {
const sortVotes = useSortVotesAfterConnect();
const [session, setSession] = useState('')
const [showQR, setShowQR] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<
    WalletProvider | undefined
  >(undefined);
  const {
    setTonConnectionProvider,
    setAddress,
  } = useWalletStore();
  const query =  useMutation(async (wallet: WalletProvider) => {
    let tonWalletProvider: TonWalletProvider | undefined;

    const onSessionLinkReady = (link: string) => {
      if (isMobile) {
        (window as any).location = link;
      } else {
        setSession(link);
      }
    };

    // chtrome extension
    if (wallet.type === Provider.EXTENSION) {
      tonWalletProvider = new ChromeExtensionWalletProvider();
    } else if (wallet.type === Provider.TONHUB) {
      // tonhub
      tonWalletProvider = new TonhubProvider({
        onSessionLinkReady,
        persistenceProvider: window.localStorage,
      });
      setShowQR(true);
    } else if (wallet.type === Provider.TONKEEPER) {
      // tonkeeper
      tonWalletProvider = new TonkeeperProvider({
        manifestUrl: "https://ton.vote/tonconnect-manifest.json",
        onSessionLinkReady,
      });
      setShowQR(true);
    }

    if (!tonWalletProvider) {
      return;
    }
    setSelectedProvider(wallet);
    setTonConnectionProvider(tonWalletProvider);
    const _wallet = await tonWalletProvider.connect();
    setAddress(_wallet.address);
    sortVotes(_wallet.address);
    localStorage.setItem(LOCAL_STORAGE_PROVIDER, wallet.type);
  });

  return {
    ...query,
    session,
    showQR,
    setShowQR,
    clearSession: () => setSession(""),
    selectedProvider,
  };

};

export const useResetConnection = () => {
  const reset = useWalletStore((store) => store.reset);
  const connection = useWalletStore((store) => store.connection);
  return () => {
    reset();
    if (connection) connection.disconnect();
    localStorage.removeItem(LOCAL_STORAGE_PROVIDER);
  };
};

export const useEagerlyConnect = () => {
  const { mutate: connect } = useConnect();
  return () => {
    const provider = localStorage.getItem(LOCAL_STORAGE_PROVIDER);
    if (!provider) {
      return;
    }
    const walletAdapter = walletAdapters.find((it) => it.type === provider);
    if (walletAdapter) {
      connect(walletAdapter);
    }
  };
};



export const getAdapterName = () => {
  return localStorage.getItem(LOCAL_STORAGE_PROVIDER);
}