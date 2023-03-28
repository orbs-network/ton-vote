import { useMutation } from "@tanstack/react-query";
import { getClientV2, getClientV4 } from "../frozen-contracts-api/logic";
import { EndpointsArgs } from "../types";
import { useClientStore, usePersistedStore } from "./store";

export const useFetchClients = () => {
  const setClients = useClientStore().setClients;

  return useMutation(async (args?: EndpointsArgs) => {
    const clientV2 = await getClientV2(args?.clientV2Endpoint, args?.apiKey);
    const clientV4 = await getClientV4(args?.clientV4Endpoint);
    setClients(clientV2, clientV4);
  });
};

export const useGetClientsOnLoad = () => {
  const store = usePersistedStore();
  const { mutate: getClients } = useFetchClients();

  return () => {
    const args: EndpointsArgs = {
      clientV2Endpoint: store.clientV2Endpoint,
      clientV4Endpoint: store.clientV4Endpoint,
      apiKey: store.apiKey,
    };

    getClients(store.clientV2Endpoint ? args : undefined);
  };
};



