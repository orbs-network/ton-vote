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

const LOCAL_STORAGE_PROVIDER = "ton_vote_wallet_provider";
interface AccountStore {
  address?: string;
  sessionLink?: string;
  setAddress: (value: string) => void;
  setSessionLink: (value: string) => void;
  setTonConnectionProvider: (provider: TonWalletProvider) => void;
  connection: TonConnection;
  selectedProvider?: WalletProvider;
  setSelectedProvider: (provider: WalletProvider) => void;
  reset: () => void;
  showQR: boolean;
  setShowQR: (value: boolean) => void;
}

const defultAcccountState = {
  address: undefined,
  sessionLink: undefined,
  connection: new TonConnection(),
  adapterName: undefined,
  showQR: false,
  selectedProvider: undefined,
};

export const useWalletStore = create<AccountStore>((set, get) => ({
  reset: () => set(defultAcccountState),
  ...defultAcccountState,
  setAddress: (address) => set({ address }),
  setSessionLink: (sessionLink) => set({ sessionLink }),
  setTonConnectionProvider: (provider) => {
    const connection = get().connection;
    connection.setProvider(provider);
    set({ connection });
  },
  setShowQR: (showQR) => {
    if (isMobile) return;
    set({ showQR });
  },
  setSelectedProvider: (selectedProvider) => set({ selectedProvider }),
}));

export const useConnection = () => {
  return useWalletStore(store => store.connection)
}

export const useSession = () => {
  return useWalletStore((store) => store.sessionLink);
};

export const useWalletAddress = () => {
  return useWalletStore((store) => store.address);
};

export const useSelectedProvider = () => {
  return useWalletStore((store) => store.selectedProvider);
};

export const useConnectQR = () => {
  const setShowQR = useWalletStore((store) => store.setShowQR);
  const showQR = useWalletStore((store) => store.showQR);

  return {
    toggleQR: (value: boolean) => setShowQR(value),
    showQR,
  };
};

export const useConnect = () => {
  const {
    setSessionLink,
    setTonConnectionProvider,
    setAddress,
    setShowQR,
    setSelectedProvider,
  } = useWalletStore();
  return useMutation(async (wallet: WalletProvider) => {
    let tonWalletProvider: TonWalletProvider | undefined;

    const onSessionLinkReady = (link: string) => {
      if (isMobile) {
        (window as any).location = link;
      } else {
        setSessionLink(link);
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

    setTonConnectionProvider(tonWalletProvider);
    setSelectedProvider(wallet);
    const _wallet = await tonWalletProvider.connect();
    setAddress(_wallet.address);

    localStorage.setItem(LOCAL_STORAGE_PROVIDER, wallet.type);
  });
};

export const useResetConnection = () => {
  const reset = useWalletStore((store) => store.reset);
  const connection = useWalletStore((store) => store.connection);
  return () => {
    reset();
    connection.disconnect();
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

