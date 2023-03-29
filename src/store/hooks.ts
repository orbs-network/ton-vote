import { useMutation } from "@tanstack/react-query";
import { getClientV2, getClientV4 } from "contracts-api/logic";
import { EndpointsArgs } from "types";
import { useClientStore, usePersistedStore } from "./store";
import { getHttpEndpoint, getHttpV4Endpoint } from "@orbs-network/ton-access";
import { DEFAULT_ENDPOINTS } from "config";
import { V2_API_KEY } from "pages/frozen/config";

const getDefaultV2Endpoint = async () => {
  let endpoint;
  try {
    endpoint = await getHttpEndpoint();
  } catch (error) {
    endpoint = DEFAULT_ENDPOINTS.v2;
  }

  return endpoint;
};

const getDefaultV4Endpoint = async () => {
  let endpoint;
  try {
     endpoint = DEFAULT_ENDPOINTS.v4;
  } catch (error) {
    endpoint = DEFAULT_ENDPOINTS.v4;
  }

  return endpoint;
};

export const useFetchClients = () => {
  const setClients = useClientStore().setClients;
  const store = usePersistedStore();

  return useMutation(async (args?: EndpointsArgs) => {
    let clientV2Endpoint, clientV4Endpoint;

    // handle V2
    if (args?.clientV2Endpoint) {
      clientV2Endpoint = args?.clientV2Endpoint;
    } else if (store.defaultClientV2Endpoint) {
      clientV2Endpoint = store.defaultClientV2Endpoint;
    } else {
      clientV2Endpoint = await getDefaultV2Endpoint();
      store.setDefaultV2ClientEndpoint(clientV2Endpoint);
    }

    

    // handle V4
    if (args?.clientV4Endpoint) {
      clientV4Endpoint = args?.clientV4Endpoint;
    } else if (store.defaultClientV4Endpoint) {
      clientV4Endpoint = store.defaultClientV4Endpoint;
    } else {
      clientV4Endpoint = await getDefaultV4Endpoint();
      store.setDefaultV4ClientEndpoint(clientV4Endpoint);
    }
    const clientV2 = getClientV2(clientV2Endpoint, args?.apiKey || V2_API_KEY);
    const clientV4 = getClientV4(clientV4Endpoint);
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
