import { create } from "zustand";
import { TonClient, TonClient4 } from "ton";
import { useMutation } from "@tanstack/react-query";
import { getClientV2, getClientV4 } from "contracts-api/main";
import { useDataQuery } from "queries";
import { persist } from "zustand/middleware";

interface PersistedState {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
  onUpdate: (
    clientV2Endpoint?: string,
    clientV4Endpoint?: string,
    apiKey?: string
  ) => void;
}

export const usePersistedStore = create(
  persist<PersistedState>(
    (set) => ({
      onUpdate: (clientV2Endpoint, clientV4Endpoint, apiKey) =>
        set({ clientV2Endpoint, clientV4Endpoint, apiKey }),
    }),
    {
      name: "ton_vote_custom_endpoints", // name of the item in the storage (must be unique)
    }
  )
);

interface Store {
  clientV2?: TonClient;
  clientV4?: TonClient4;
  setClients: (clientV2: TonClient, clientV4: TonClient4) => void;
  setShowSetEndpoint: (value: boolean) => void;
  showSetEndpoint: boolean;
  endpointError: boolean;
  setEndpointError: (value: boolean) => void;
}

export const useClientStore = create<Store>((set, get) => ({
  showSetEndpoint: false,
  endpointError: false,
  setClients: (clientV2, clientV4) => set({ clientV2, clientV4 }),
  setShowSetEndpoint: (showSetEndpoint) => set({ showSetEndpoint }),
  setEndpointError: (endpointError) => {
    set({ endpointError, showSetEndpoint: endpointError ? true : false });
  },
}));

export const useSetEndpointPopup = () => {
  const store = useClientStore(
    (store) => store
  );
  return {
    show: store.showSetEndpoint,
    toggle: (value: boolean) => store.setShowSetEndpoint(value),
    endpointError: store.endpointError,
    toggleError: (value: boolean) => store.setEndpointError(value),
  };
};

export const useClients = () => {
  const clientV4 = useClientStore((store) => store.clientV4);
  const clientV2 = useClientStore((store) => store.clientV2);
  return { clientV2, clientV4 };
};

type GetClientsArgs = {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
};

const useGetClients = () => {
  const setClients = useClientStore((store) => store.setClients);

  return useMutation(async (args?: GetClientsArgs) => {
    const clientV2 = await getClientV2(args?.clientV2Endpoint, args?.apiKey);
    const clientV4 = await getClientV4(args?.clientV4Endpoint);
    setClients(clientV2, clientV4);
  });
};

export const useGetClientsOnLoad = () => {
  const store = usePersistedStore();
  const { mutate: getClients } = useGetClients();

  return () => {
    getClients({
      clientV2Endpoint: store.clientV2Endpoint,
      clientV4Endpoint: store.clientV4Endpoint,
      apiKey: store.apiKey,
    });
  };
};

export const useCustomEndpoints = () => {
  return usePersistedStore();
};

type UpdateEndpointsArgs = {
  clientV2Endpoint?: string;
  clientV4Endpoint?: string;
  apiKey?: string;
};

export const useUpdateEndpoints = () => {
  const { onUpdate: onEndpointsUpdate } = usePersistedStore();
  const { mutateAsync: getClients } = useGetClients();
  const { refetch } = useDataQuery();

  return useMutation(async (args?: UpdateEndpointsArgs) => {
    await getClients({
      clientV2Endpoint: args?.clientV2Endpoint,
      clientV4Endpoint: args?.clientV4Endpoint,
      apiKey: args?.apiKey,
    });

    onEndpointsUpdate(
      args?.clientV2Endpoint,
      args?.clientV4Endpoint,
      args?.apiKey
    );
    await refetch();
  });
};
