import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "config";
import { contractDataService, serverDataService } from "data-service";
import { useDaoId } from "hooks";
import _ from "lodash";
import { useIsCustomEndpoint } from "store";

export const useDaoQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const daoId = useDaoId();
  return useQuery(
    [QueryKeys.DAO, daoId],
    async () => {
      if (isCustomEndpoint) {
        return contractDataService.getDAO(daoId);
      } else {
        return serverDataService.getDAO(daoId);
      }
    },
    {
      enabled: !!daoId,
    }
  );
};

export const useDaoProposalsQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const daoId = useDaoId();
  return useQuery(
    [QueryKeys.DAO_PROPOSALS, daoId],
    async () => {
      if (isCustomEndpoint) {
        return contractDataService.getDAOProposals(daoId);
      } else {
        return serverDataService.getDAOProposals(daoId);
      }
    },
    {
      enabled: !!daoId,
    }
  );
};
