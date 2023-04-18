import { useQueryClient, useQuery } from "@tanstack/react-query";
import { STATE_REFETCH_INTERVAL, QueryKeys } from "config";
import { useProposalAddress } from "hooks";
import _ from "lodash";
import { Proposal, ProposalStatus } from "types";
import { getProposalStatus, Logger } from "utils";
import { api, getProposalFromContract } from "lib";
import { useProposalPersistedStore } from "./store";

export const useGetProposal = () => {
  const { getLatestMaxLtAfterTx } = useProposalPersistedStore();

  return async (
    proposalAddress: string,
    isCustomEndpoint: boolean,
    state?: Proposal,
    signal?: AbortSignal
  ): Promise<Proposal | null> => {
    const proposalPersistStore = useProposalPersistedStore.getState();
    const latestMaxLtAfterTx = getLatestMaxLtAfterTx(proposalAddress);

    const contractProposal = () => {
      return getProposalFromContract(
        proposalAddress,
        state,
        latestMaxLtAfterTx
      );
    };

    const serverProposal = async (): Promise<Proposal | null> => {
      try {
        const state = await api.getProposal(proposalAddress, signal);
        console.log(state);
        
        if (_.isEmpty(state.metadata)) {
          throw new Error("Proposal not found is server");
        }
        return state;
      } catch (error) {
        return contractProposal();
      }
    };

    if (isCustomEndpoint) {
      return contractProposal();
    }

    // if (!(await api.validateServerLastUpdate(signal))) {
    //   Logger(`server is outdated, fetching from contract ${proposalAddress}`);
    //   return contractProposal();
    // }

    if (!latestMaxLtAfterTx) {
      return serverProposal();
    }

    const serverMaxLt = await api.getMaxLt(signal);

    if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
      Logger(`server latestMaxLtAfterTx is outdated, fetching from contract`);
      return contractProposal();
    }
    proposalPersistStore.setLatestMaxLtAfterTx(proposalAddress, undefined);
    return serverProposal();
  };
};

export const useProposalPageQuery = (isCustomEndpoint: boolean) => {
  const proposalAddress = useProposalAddress();
  const getProposal = useGetProposal();
  const queryKey = _.compact([QueryKeys.PROPOSAL, proposalAddress]);
  const queryClient = useQueryClient();

  return useQuery(
    queryKey,
    async ({ signal }) => {
      // when we have state already and vote finished, we return the cached state
      const state = queryClient.getQueryData<Proposal>(queryKey);

      const voteStatus = state?.metadata && getProposalStatus(state?.metadata);
      const closed = voteStatus === ProposalStatus.CLOSED;

      // vote finished, we no longer need to refetch to get new data
      if (closed) return state;

      return getProposal(proposalAddress, isCustomEndpoint, state, signal);
    },
    {
      refetchInterval: STATE_REFETCH_INTERVAL,
      staleTime: 30_000,
      enabled: !!proposalAddress,
    }
  );
};
