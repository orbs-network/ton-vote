import { useQuery } from "@tanstack/react-query";
import { FETCH_PROPOSALS_INTERVAL, QueryKeys } from "config";
import { contract, server } from "data-service";
import { useDaoAddress, useIsCustomEndpoint } from "hooks";
import _ from "lodash";
import { useAppPersistedStore } from "store";

export const useDaoProposalsQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  const daoId = useDaoAddress();

  return useQuery(
    [QueryKeys.PROPOSALS, daoId, clientV2Endpoint, clientV4Endpoint],
    async () => {
      if (isCustomEndpoint) {
        return contract.getDaoProposals(daoId);
      } else {
        return server.getDaoProposals(daoId);
      }
    },
    {
      enabled: !!daoId,
      // refetchInterval: FETCH_PROPOSALS_INTERVAL,
    }
  );
};
