import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TonWalletProvider,
  ChromeExtensionWalletProvider,
  TonhubProvider,
  TonkeeperProvider,
} from "@ton-defi.org/ton-connection";
import { LOCAL_STORAGE_PROVIDER, walletAdapters } from "config";
import { getClientV2, getClientV4 } from "contracts-api/logic";
import { useWalletVote } from "hooks";
import { useDataFromQueryClient, useStateQuery } from "queries";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import { WalletProvider, Provider, EndpointsArgs, QueryKeys } from "types";
import {
  useClientStore,
  useServerStore,
  useEndpointsStore,
  usePersistedStore,
  useContractStore,
  useVotesPaginationStore,
  useWalletStore,
} from "./store";

export const useSetEndpointPopup = () => {
  const store = useEndpointsStore((store) => store);
  return {
    show: store.showSetEndpoint,
    toggle: (value: boolean) => store.setShowSetEndpoint(value),
    endpointError: store.endpointError,
    toggleError: (value: boolean) => store.setEndpointError(value),
  };
};

export const useClient = () => {
  const clientV2 = useClientStore((store) => store.clientV2);
  const clientV4 = useClientStore((store) => store.clientV4);
  return { clientV2, clientV4 };
};

export const useGetClient = () => {
  const setClients = useClientStore((store) => store.setClients);

  return useMutation(async (args?: EndpointsArgs) => {
    const clientV2 = await getClientV2(args?.clientV2Endpoint, args?.apiKey);
    const clientV4 = await getClientV4(args?.clientV4Endpoint);
    setClients(clientV2, clientV4);
  });
};

export const useGetClientsOnLoad = () => {
  const store = usePersistedStore();
  const { mutate: getClients } = useGetClient();

  return () => {
    const args: EndpointsArgs = {
      clientV2Endpoint: store.clientV2Endpoint,
      clientV4Endpoint: store.clientV4Endpoint,
      apiKey: store.apiKey,
    };

    getClients(store.clientV2Endpoint ? args : undefined);
  };
};




export const useUpdateEndpoints = () => {
  const queryClient = useQueryClient();
  const { onUpdate: onEndpointsUpdate } = usePersistedStore();
  const { mutateAsync: getClients } = useGetClient();
  const resetTransactions = useContractStore().reset;
  const resetVotesPagination = useVotesPaginationStore().reset;
  const { reset: resetDataUpdater } = useServerStore();
  const { refetch } = useStateQuery();

  return useMutation(async (args?: EndpointsArgs) => {
    resetTransactions();
    resetDataUpdater();
    resetVotesPagination();
    onEndpointsUpdate(
      args?.clientV2Endpoint,
      args?.clientV4Endpoint,
      args?.apiKey
    );
    await getClients({
      clientV2Endpoint: args?.clientV2Endpoint,
      clientV4Endpoint: args?.clientV4Endpoint,
      apiKey: args?.apiKey,
    });

    queryClient.removeQueries({ queryKey: [QueryKeys.PROPOSAL_INFO] });
    queryClient.removeQueries({ queryKey: [QueryKeys.STATE] });
    await refetch();
  });
};

export const useConnection = () => {
  return useWalletStore((store) => store.connection);
};

export const useWalletAddress = () => {
  return useWalletStore((store) => store.address);
};

export const useTxLoading = () => {
  const txLoading =  useWalletStore((store) => store.txLoading);
  const setTxLoading = useWalletStore((store) => store.setTxLoading);

  return {
    txLoading,
    setTxLoading,
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

export const useConnect = () => {
  const [session, setSession] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    WalletProvider | undefined
  >(undefined);
  const { setTonConnectionProvider, setAddress } = useWalletStore();
  const onConnectCallback = useOnConnectCallback();
  const query = useMutation(async (wallet: WalletProvider) => {
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
    onConnectCallback(_wallet.address);
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
