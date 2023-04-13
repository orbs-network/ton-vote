import { useQueryClient, useQuery } from "@tanstack/react-query";
import { STATE_REFETCH_INTERVAL, QueryKeys } from "config";
import { useProposalAddress } from "hooks";
import { getProposalState } from "lib";
import _ from "lodash";
import { ProposalStatus, ProposalState } from "types";
import { getProposalStatus, Logger } from "utils";
import { useEnpointsStore } from "store";


export const useProposalStateQuery = (isCustomEndpoint: boolean) => {
  const proposalAddress = useProposalAddress();
  const { clientV2Endpoint, clientV4Endpoint, apiKey } = useEnpointsStore();

  const queryKey = [
    QueryKeys.STATE,
    proposalAddress,
    clientV2Endpoint,
    clientV4Endpoint,
    apiKey,
  ];
  const queryClient = useQueryClient();

  return useQuery(
    queryKey,
    async ({ signal }) => {
      // when we have state already and vote finished, we return the cached state
      const state = queryClient.getQueryData<ProposalState>(queryKey);
      const voteStatus =
        state?.proposalMetadata && getProposalStatus(state?.proposalMetadata);
      const voteFinished = voteStatus === ProposalStatus.CLOSED;

      if (voteFinished) return state;

      return getProposalState(proposalAddress, isCustomEndpoint, state, signal);
    },
    {
      refetchInterval: STATE_REFETCH_INTERVAL,
      staleTime: 5_000,
      enabled: !!proposalAddress,
    }
  );
};
