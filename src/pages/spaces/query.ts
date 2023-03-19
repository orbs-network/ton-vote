import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "config";
import { contractDataService, serverDataService } from "data-service";
import _ from "lodash";
import { useIsCustomEndpoint } from "store";

export const useDaosQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  return useQuery([QueryKeys.DAOS], async () => {
    return isCustomEndpoint
      ? contractDataService.getDAOS()
      : serverDataService.getDAOS();
  });
};
