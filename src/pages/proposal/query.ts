import { useQueryClient, useQuery } from "@tanstack/react-query";
import { STATE_REFETCH_INTERVAL, QueryKeys } from "config";
import { useProposalAddress } from "hooks";
import _ from "lodash";
import { Proposal, ProposalStatus } from "types";
import { getProposalStatus, isProposalWhitelisted, Logger } from "utils";
import { lib } from "lib/lib";
import { useProposalPersistedStore } from "./store";
import {
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
  getSingleVoterPower,
  getTransactions,
} from "ton-vote-contracts-sdk";
import { api } from "api";
import { Transaction } from "ton-core";

export const useGetProposal = () => {
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistedStore();

  return async (
    proposalAddress: string,
    isCustomEndpoint: boolean,
    state?: Proposal,
    signal?: AbortSignal
  ): Promise<Proposal | null> => {
    const latestMaxLtAfterTx = getLatestMaxLtAfterTx(proposalAddress);

    const contractProposal = async () => {
      Logger("getting state from contract");
      const clientV2 = await getClientV2();
      const clientV4 = await getClientV4();
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

    const serverProposal = async (): Promise<Proposal | null> => {
      try {
        const state = await api.getProposal(proposalAddress, signal);

        if (_.isEmpty(state.metadata)) {
          throw new Error("Proposal not found is server");
        }
        Logger("getting state from server");
        return state;
      } catch (error) {
        if (error instanceof Error) {
          Logger(error.message);
        }
        return contractProposal();
      }
    };

    try {
      if (isCustomEndpoint) {
        throw new Error("getting state from contract after transaction");
      }

      if (!latestMaxLtAfterTx) {
        return serverProposal();
      }

      const serverMaxLt = await api.getMaxLt(proposalAddress, signal);

      if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
        throw new Error(
          `server latestMaxLtAfterTx is outdated, fetching from contract, latestMaxLtAfterTx: ${latestMaxLtAfterTx}, serverMaxLt: ${serverMaxLt}`
        );
      }
      setLatestMaxLtAfterTx(proposalAddress, undefined);
      return serverProposal();
    } catch (error) {
      if (error instanceof Error) {
        Logger(error.message);
      }
      return contractProposal();
    }
  };
};

export const useProposalPageQuery = (isCustomEndpoint: boolean = false) => {
  const proposalAddress = useProposalAddress();
  const getProposal = useGetProposal();
  const queryKey = [QueryKeys.PROPOSAL_PAGE, proposalAddress];
  const queryClient = useQueryClient();
  const { getLatestMaxLtAfterTx } = useProposalPersistedStore();

  const isWhitelisted = isProposalWhitelisted(proposalAddress);

  return useQuery(
    queryKey,
    async ({ signal }) => {
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

      return getProposal(proposalAddress, isCustomEndpoint, state, signal);
    },
    {
      retry: isWhitelisted ? 3 : false,
      refetchInterval: STATE_REFETCH_INTERVAL,
      staleTime: 30_000,
      enabled: !!proposalAddress,
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

export const useWalletVotingPower = (
  account?: string,
  proposal?: Proposal | null
) => {
  const proposalAddress = useProposalAddress();

  return useQuery(
    [QueryKeys.SIGNLE_VOTING_POWER, account],
    async ({ signal }) => {
      const clientV4 = await getClientV4();
      const allNftHolders = await lib.getAllNftHolders(
        proposalAddress,
        clientV4,
        proposal!.metadata!,
        signal
      );
      Logger(`Fetching voting power for account: ${account}`);

      return getSingleVoterPower(
        clientV4,
        account!,
        proposal?.metadata!,
        proposal?.metadata?.votingPowerStrategy!,
        allNftHolders
      );
    },
    {
      enabled: !!account && !!proposal,
    }
  );
};
