import { useQueryClient, useQuery, QueryKey, useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { STATE_REFETCH_INTERVAL, QueryKeys } from "config";
import { useConnection } from "ConnectionProvider";
import { useProposalAddress } from "hooks";
import { getContractState, api } from "lib";
import _ from "lodash";
import { useProposalStatusQuery, useClientsQuery } from "query/queries";
import { useMemo } from "react";
import { getProposalInfo } from "ton-vote-sdk";
import { ProposalStatus, ProposalState } from "types";
import { Logger, nFormatter } from "utils";
import { useProposalPersistedStore } from "./store";
import { useEnpointsStore } from "store";
import * as TonVoteSDK from 'ton-vote-sdk'
export const useProposalVotesCount = () => {
  const { proposalVotes, dataUpdatedAt } = useProposalVotes();

  return useMemo(() => {
    const grouped = _.groupBy(proposalVotes, "vote");

    return {
      yes: nFormatter(_.size(grouped.Yes)),
      no: nFormatter(_.size(grouped.No)),
      abstain: nFormatter(_.size(grouped.Abstain)),
    };
  }, [dataUpdatedAt]);
};

export const useProposalVotes = () => {
  const proposalAddress = useProposalAddress();
  const query = useProposalStateQuery(proposalAddress);
  const walletAddress = useConnection().address;

  const _proposalVotes = query.data?.votes;
  const size = _.size(_proposalVotes);

  const { proposalVotes, walletVote } = useMemo(() => {
    return {
      proposalVotes: _.filter(
        _proposalVotes,
        (it) => it.address !== walletAddress
      ),
      walletVote: _.find(_proposalVotes, (it) => it.address === walletAddress),
    };
  }, [size, walletAddress]);

  return { ...query, proposalVotes, walletVote };
};

export const useIsCustomEndpoint = () => {
  const { clientV2Endpoint, clientV4Endpoint } = useEnpointsStore();

  return !!clientV2Endpoint && !!clientV4Endpoint;
};



export const useProposalStateQuery = (
  proposalAddress: string,
  refetchInterval: number = STATE_REFETCH_INTERVAL
) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const proposalStatus = useProposalStatusQuery(proposalAddress);
  const queryKey = useGetQueryKey([QueryKeys.STATE, proposalAddress]);
  const queryClient = useQueryClient();
  const voteFinished = proposalStatus === ProposalStatus.CLOSED;
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx, latestMaxLtAfterTx } =
    useProposalPersistedStore();

  const clients = useClientsQuery();

  const { refetch: fetchProposalInfo } =
    useProposalMetadataQuery();

  return useQuery(
    queryKey,
    async ({ signal }) => {
      const { data: proposalInfo } = await fetchProposalInfo();

      if (!proposalInfo) throw new Error("Missing proposal info");

      const state = queryClient.getQueryData(queryKey) as ProposalState | null;

      const _getContractState = () => {
        return getContractState(
          clients?.clientV2!,
          clients?.clientV4!,
          proposalAddress,
          proposalInfo,
          state,
          getLatestMaxLtAfterTx(proposalAddress)
        );
      };

      if (isCustomEndpoint) {
        Logger("custom endpoint, fetching from contract");
        return _getContractState() || null;
      }
      const serverState = await api.getState(
        proposalAddress,
        signal,
        getLatestMaxLtAfterTx(proposalAddress)
      );
      if (serverState) {
        setLatestMaxLtAfterTx(proposalAddress, undefined);
      }
      return serverState || _getContractState() || null;
    },
    {
      refetchInterval: !voteFinished ? refetchInterval : undefined,
      staleTime: voteFinished ? Infinity : 2_000,
      enabled: !!clients?.clientV2 && !!clients?.clientV4 && !!proposalAddress,
    }
  );
};


const useGetQueryKey = (key: string[]): QueryKey => {
  const { clientV2Endpoint, clientV4Endpoint, apiKey } = useEnpointsStore();
  return [...key, clientV2Endpoint, clientV4Endpoint, apiKey];
};




export const useVerifyProposalResults = (proposalAddress: string) => {
  const clients = useClientsQuery();

  const currentResults = useProposalStateQuery(proposalAddress).data?.results;

  const maxLt = useProposalStateQuery(proposalAddress).data?.maxLt;

  return useMutation(async () => {
    analytics.GA.verifyButtonClick();

    const contractProposal = await getProposalInfo(
      clients!.clientV2,
      clients!.clientV4,
      proposalAddress
    );
    const contractState = await getContractState(
      clients!.clientV2,
      clients!.clientV4,
      proposalAddress,
      contractProposal,
      { maxLt } as ProposalState
    );

    const compareToResults = contractState?.results;

    Logger({
      currentResults,
      compareToResults,
    });

    return _.isEqual(currentResults, compareToResults);
  });
};





export const useProposalMetadataQuery = () => {
  const proposalAddress = useProposalAddress();
  const isCustomEndpoint = useIsCustomEndpoint();
  const clients = useClientsQuery()
  const queryKey = useGetQueryKey([
    QueryKeys.PROPOSAL_METADATA,
    proposalAddress,
  ]);

  return useQuery(
    queryKey,
    async ({signal}) => {
      if (isCustomEndpoint) {
        return TonVoteSDK.getProposalInfo(
          clients!.clientV2,
          clients!.clientV4,
          proposalAddress
        );
      }
      return api.getDaoProposalMetadata(proposalAddress, signal);
    },
    {
      enabled: !!clients?.clientV2 && !!clients.clientV4,
    }
  );
}