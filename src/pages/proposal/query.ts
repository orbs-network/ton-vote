import { useQueryClient, useQuery } from "@tanstack/react-query";
import { STATE_REFETCH_INTERVAL, QueryKeys } from "config";
import { useProposalAddress } from "hooks";
import _ from "lodash";
import { Proposal, ProposalStatus } from "types";
import { getProposalStatus, isProposalWhitelisted, Logger } from "utils";
import { lib } from "lib/lib";
import { useProposalPersistedStore } from "./store";
import { filterTxByTimestamp, getTransactions } from "ton-vote-contracts-sdk";
import { api } from "api";
import { Transaction } from "ton-core";
import { proposals } from "data/foundation/data";
import { useGetClients } from "query/getters";

const useContractProposal = () => {
  const proposalAddress = useProposalAddress();
  const clients = useGetClients().data;
  const { getLatestMaxLtAfterTx } = useProposalPersistedStore();

  return async () => {
    const latestMaxLtAfterTx = getLatestMaxLtAfterTx(proposalAddress);

    Logger("getting state from contract");
    const clientV2 = clients!.clientV2;
    const clientV4 = clients!.clientV4;
    let transactions: Transaction[] | undefined;

    if (latestMaxLtAfterTx) {
      const result = await getTransactions(clientV2, proposalAddress);
      transactions = filterTxByTimestamp(result.allTxns, latestMaxLtAfterTx);
    }

    return lib.getProposalFromContract(
      clientV2,
      clientV4,
      proposalAddress,
      undefined,
      transactions
    );
  };
};

const useServerProposal = () => {
  const contractProposal = useContractProposal();
  const proposalAddress = useProposalAddress();
  return async (signal?: AbortSignal): Promise<Proposal | null> => {
    const state = await api.getProposal(proposalAddress, signal);
    try {
      if (_.isEmpty(state.metadata)) {
        throw new Error("Proposal not found is server");
      }
      if (_.isEmpty(state.proposalResult)) {
        throw new Error("Proposal result is not synced");
      }
      Logger("getting state from server");
      return state;
    } catch (error) {
      return contractProposal();
    }
  };
};

export const useProposalFromQueryParam = (
  isCustomEndpoint: boolean = false
) => {
  const proposalAddress = useProposalAddress();
  const clients = useGetClients().data;

  const queryKey = [QueryKeys.PROPOSAL_PAGE, proposalAddress];
  const queryClient = useQueryClient();
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistedStore();
  const latestMaxLtAfterTx = getLatestMaxLtAfterTx(proposalAddress);

  const isWhitelisted = isProposalWhitelisted(proposalAddress);
  const contractProposal = useContractProposal();
  const serverProposal = useServerProposal();
  return useQuery(
    queryKey,
    async ({ signal }) => {
      const hardcodedProposal = proposals[proposalAddress!];

      if (hardcodedProposal) {
        return hardcodedProposal;
      }
      if (!isWhitelisted) {
        throw new Error("Proposal not whitelisted");
      }
      const state = queryClient.getQueryData<Proposal>(queryKey);

      // when we have state already and vote finished, we return the cached state
      const voteStatus = state?.metadata && getProposalStatus(state?.metadata);
      const preventRefetch =
        voteStatus === ProposalStatus.CLOSED ||
        voteStatus === ProposalStatus.NOT_STARTED;

      // vote finished or not started, no need to refetch to get new data
      if (preventRefetch) return state;

      try {
        if (isCustomEndpoint) {
          throw new Error("getting state from contract after transaction");
        }

        if (!latestMaxLtAfterTx) {
          return serverProposal(signal);
        }

        const serverMaxLt = await api.getMaxLt(proposalAddress, signal);

        if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
          throw new Error(
            `server latestMaxLtAfterTx is outdated, fetching from contract, latestMaxLtAfterTx: ${latestMaxLtAfterTx}, serverMaxLt: ${serverMaxLt}`
          );
        }
        setLatestMaxLtAfterTx(proposalAddress, undefined);
        return serverProposal(signal);
      } catch (error) {
        if (error instanceof Error) {
          Logger(error.message);
        }
        return contractProposal();
      }
    },
    {
      retry: isWhitelisted ? 3 : false,
      refetchInterval: STATE_REFETCH_INTERVAL,
      staleTime: 30_000,
      enabled: !!proposalAddress && !!clients?.clientV2 && !!clients?.clientV4,
      initialData: () => {
        const latestMaxLtAfterTx = getLatestMaxLtAfterTx(proposalAddress);
        if (!latestMaxLtAfterTx) {
          return queryClient.getQueryData<Proposal>([
            QueryKeys.PROPOSAL,
            proposalAddress,
          ]);
        }
      },
    }
  );
};
