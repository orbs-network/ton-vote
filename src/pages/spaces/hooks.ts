import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "config";
import { contract, server } from "data-service";
import { useIsCustomEndpoint } from "hooks";
import _ from "lodash";
import { useAppPersistedStore } from "store";

export const useDaosQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  return useQuery(
    [QueryKeys.DAOS, clientV2Endpoint, clientV4Endpoint],
    async () => {
      if (isCustomEndpoint) {
        return contract.getDAOS();
      }
      return server.getDAOS();
    }
  );
};
