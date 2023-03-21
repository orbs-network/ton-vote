import { QueryKey, useQuery } from "@tanstack/react-query";
import { FETCH_PROPOSALS_INTERVAL, QueryKeys } from "config";
import { contract, server } from "data-service";
import { useDaoId, useIsCustomEndpoint } from "hooks";
import _ from "lodash";
import { useAppPersistedStore } from "store";

export const useDaoQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const daoId = useDaoId();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  return useQuery(
    [QueryKeys.DAO, daoId, clientV2Endpoint, clientV4Endpoint],
    async () => {
      if (isCustomEndpoint) {
        return contract.getDAO(daoId);
      } else {
        return server.getDAO(daoId);
      }
    },
    {
      enabled: !!daoId,
    }
  );
};

export const useDaoProposalsQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  const daoId = useDaoId();

  return useQuery(
    [QueryKeys.DAO_PROPOSALS, daoId, clientV2Endpoint, clientV4Endpoint],
    async () => {
      if (isCustomEndpoint) {
        return contract.getDAOProposals(daoId);
      } else {
        return server.getDAOProposals(daoId);
      }
    },
    {
      enabled: !!daoId,
      refetchInterval: FETCH_PROPOSALS_INTERVAL,
    }
  );
};
