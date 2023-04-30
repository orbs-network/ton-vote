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

const contractProposal = async (
  proposalAddress: string,
  latestMaxLtAfterTx?: string
) => {
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

const serverProposal = async (
  proposalAddress: string,
  signal?: AbortSignal
): Promise<Proposal | null> => {
  const state = await api.getProposal(proposalAddress, signal);

  if (_.isEmpty(state.metadata)) {
    throw new Error("Proposal not found is server");
  }
  Logger("getting state from server");
  return state;
};

export const useProposalPageQuery = (isCustomEndpoint: boolean = false) => {
  const proposalAddress = useProposalAddress();
  const queryKey = [QueryKeys.PROPOSAL_PAGE, proposalAddress];
  const queryClient = useQueryClient();
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useProposalPersistedStore();
  const latestMaxLtAfterTx = getLatestMaxLtAfterTx(proposalAddress);

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

      try {
        if (isCustomEndpoint) {
          throw new Error("getting state from contract after transaction");
        }

        if (!latestMaxLtAfterTx) {
          return serverProposal(proposalAddress, signal);
        }

        const serverMaxLt = await api.getMaxLt(proposalAddress, signal);

        if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
          throw new Error(
            `server latestMaxLtAfterTx is outdated, fetching from contract, latestMaxLtAfterTx: ${latestMaxLtAfterTx}, serverMaxLt: ${serverMaxLt}`
          );
        }
        setLatestMaxLtAfterTx(proposalAddress, undefined);
        return serverProposal(proposalAddress, signal);
      } catch (error) {
        if (error instanceof Error) {
          Logger(error.message);
        }
        return contractProposal(proposalAddress, latestMaxLtAfterTx);
      }
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
