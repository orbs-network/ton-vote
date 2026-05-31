import { TonClient, TonClient4 } from "ton";
import { getHttpEndpoint, getHttpV4Endpoint } from "@orbs-network/ton-access";
import {
  getClientV2,
  getClientV4,
} from "ton-vote-contracts-sdk";
import {
  CLIENT_V2_API_KEY,
  DEFAULT_CLIENT_V2_ENDPOINT,
  DEFAULT_CLIENT_V4_ENDPOINT,
} from "config";
import { Logger } from "utils";

export type RpcEndpoint<TClient = unknown> = {
  client?: TClient;
  endpoint?: string;
  resolveEndpoint?: () => Promise<string>;
  apiKey?: string;
  label?: string;
};

type RpcFallbackArgs<TClient, TResult> = {
  endpoints: RpcEndpoint<TClient>[];
  getClient: (rpc: RpcEndpoint<TClient>) => Promise<TClient>;
  request: (
    client: TClient,
    rpc: RpcEndpoint<TClient>
  ) => Promise<TResult>;
  shouldFallback?: (result: TResult) => boolean;
  logPrefix?: string;
};

type ClientFallbackArgs<TClient, TResult> = Omit<
  RpcFallbackArgs<TClient, TResult>,
  "endpoints" | "getClient" | "request"
> & {
  endpoints?: RpcEndpoint<TClient>[];
  request: (
    client: TClient,
    rpc: RpcEndpoint<TClient>
  ) => Promise<TResult>;
};

export const CLIENT_V2_RPC_ENDPOINTS: RpcEndpoint<TonClient>[] = [
  {
    label: "toncenter",
    endpoint: DEFAULT_CLIENT_V2_ENDPOINT,
    apiKey: CLIENT_V2_API_KEY,
  },
  { label: "ton-access", resolveEndpoint: getHttpEndpoint },
];

export const CLIENT_V4_RPC_ENDPOINTS: RpcEndpoint<TonClient4>[] = [
  { label: "tonhub", endpoint: DEFAULT_CLIENT_V4_ENDPOINT },
  { label: "ton-access", resolveEndpoint: getHttpV4Endpoint },
];

export const getClientV2RpcEndpoints = (clientV2?: TonClient) => {
  if (!clientV2) return CLIENT_V2_RPC_ENDPOINTS;

  return [
    { label: "current-v2-client", client: clientV2 },
    ...CLIENT_V2_RPC_ENDPOINTS.filter(
      (rpc) => !!rpc.endpoint || !!rpc.resolveEndpoint
    ),
  ];
};

export const getClientV4RpcEndpoints = (clientV4?: TonClient4) => {
  if (!clientV4) return CLIENT_V4_RPC_ENDPOINTS;

  return [
    { label: "current-v4-client", client: clientV4 },
    ...CLIENT_V4_RPC_ENDPOINTS.filter(
      (rpc) => !!rpc.endpoint || !!rpc.resolveEndpoint
    ),
  ];
};

export const getClientV2FallbackEndpoints = (
  endpoint?: string,
  apiKey?: string
): RpcEndpoint<TonClient>[] => {
  if (!endpoint) return CLIENT_V2_RPC_ENDPOINTS;

  return [
    { label: "selected-v2-client", endpoint, apiKey },
    ...CLIENT_V2_RPC_ENDPOINTS.filter((rpc) => rpc.endpoint !== endpoint),
  ];
};

export const getClientV4FallbackEndpoints = (
  endpoint?: string
): RpcEndpoint<TonClient4>[] => {
  if (!endpoint) return CLIENT_V4_RPC_ENDPOINTS;

  return [
    { label: "selected-v4-client", endpoint },
    ...CLIENT_V4_RPC_ENDPOINTS.filter((rpc) => rpc.endpoint !== endpoint),
  ];
};

const getRpcLabel = <TClient,>(rpc: RpcEndpoint<TClient>) => {
  return rpc.label || rpc.endpoint || "default";
};

const resolveRpcEndpoint = async <TClient,>(
  rpc: RpcEndpoint<TClient>
): Promise<RpcEndpoint<TClient>> => {
  if (rpc.client || rpc.endpoint || !rpc.resolveEndpoint) {
    return rpc;
  }

  return {
    ...rpc,
    endpoint: await rpc.resolveEndpoint(),
  };
};

export const getResultWithRpcFallback = async <TClient, TResult>({
  endpoints,
  getClient,
  request,
  shouldFallback = (result) => result === null || result === undefined,
  logPrefix,
}: RpcFallbackArgs<TClient, TResult>): Promise<TResult> => {
  let lastError: unknown;
  let lastFallbackResult: TResult | undefined;
  let hasFallbackResult = false;

  for (const rpc of endpoints) {
    try {
      const resolvedRpc = await resolveRpcEndpoint(rpc);
      const client = resolvedRpc.client || (await getClient(resolvedRpc));
      const result = await request(client, resolvedRpc);

      if (!shouldFallback(result)) {
        return result;
      }

      lastFallbackResult = result;
      hasFallbackResult = true;

      if (logPrefix) {
        Logger(`${logPrefix}: fallback result from ${getRpcLabel(rpc)}`);
      }
    } catch (error) {
      lastError = error;

      if (logPrefix) {
        Logger(`${logPrefix}: failed via ${getRpcLabel(rpc)}`, error);
      }
    }
  }

  if (hasFallbackResult) {
    return lastFallbackResult as TResult;
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("No RPC endpoints provided");
};

export const getResultWithClientV2Fallback = async <TResult>({
  endpoints = CLIENT_V2_RPC_ENDPOINTS,
  ...args
}: ClientFallbackArgs<TonClient, TResult>) => {
  return getResultWithRpcFallback({
    ...args,
    endpoints,
    getClient: ({ endpoint, apiKey }) => getClientV2(endpoint, apiKey),
  });
};

export const getResultWithClientV4Fallback = async <TResult>({
  endpoints = CLIENT_V4_RPC_ENDPOINTS,
  ...args
}: ClientFallbackArgs<TonClient4, TResult>) => {
  return getResultWithRpcFallback({
    ...args,
    endpoints,
    getClient: ({ endpoint }) => getClientV4(endpoint),
  });
};
