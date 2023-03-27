import { QueryKey, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys, STATE_REFETCH_INTERVAL } from "config";
import { contract, server } from "data-service";
import { useIsCustomEndpoint } from "hooks";
import { useAppPersistedStore, useEnpointModal } from "store";
import { ProposalState, ProposalStatus } from "types";
import { getProposalStatus, Logger } from "utils";

export const useDaoMetadataQuery = (daoAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const queryKey = useGetQueryKey([QueryKeys.DAO_METADATA, daoAddress]);

  return useQuery(
    queryKey,
    async () => {
      if (isCustomEndpoint) {
        return contract.getDaoMetadata(daoAddress);
      }
      return server.getDaoMetadata(daoAddress);
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useDaosQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const queryKey = useGetQueryKey([QueryKeys.DAOS]);

  return useInfiniteQuery(
    queryKey,
    async () => {
      if (isCustomEndpoint) {
        return contract.getDaos();
      }
      return server.getDaos();
    },
    {
      staleTime: Infinity,
      getNextPageParam: (lastPage) => lastPage.endDaoId,
    }
  );
};

export const useDaoRolesQuery = (daoAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const queryKey = useGetQueryKey([QueryKeys.DAO_ROLES, daoAddress]);

  return useQuery(
    queryKey,
    () => {
      if (isCustomEndpoint) {
        return contract.getDaoRoles(daoAddress);
      }
      return server.getDaoRoles(daoAddress);
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useDaoProposalsQuery = (daoAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();

  const queryKey = useGetQueryKey([QueryKeys.PROPOSALS, daoAddress]);

  return useQuery(queryKey, () => {
    if (isCustomEndpoint) {
      return contract.getDaoProposals(daoAddress);
    } else {
      return server.getDaoProposals(daoAddress);
    }
  });
};

export const useProposalMetadataQuery = (proposalAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const queryKey = useGetQueryKey([QueryKeys.PROPOSAL, proposalAddress]);

  return useQuery(queryKey, () => {
    if (isCustomEndpoint)
      return contract.getDaoProposalMetadata(proposalAddress);
    return server.getDapProposalMetadata(proposalAddress);
  });
};

export const useProposalInfoQuery = (proposalAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const queryKey = useGetQueryKey([QueryKeys.PROPOSAL_INFO, proposalAddress]);

  return useQuery(
    queryKey,
    () => {
      if (isCustomEndpoint) return contract.getDaoProposalInfo(proposalAddress);
      return server.getDaoProposalInfo(proposalAddress);
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useProposalStatusQuery = (
  proposalAddress: string,
  refetchInterval?: number
) => {
  const { data: proposalInfo } = useProposalInfoQuery(proposalAddress);
  const queryKey = useGetQueryKey([
    QueryKeys.PROPOSAL_TIMELINE,
    proposalAddress,
  ]);

  const query = useQuery(
    queryKey,
    async () => {
      if (!proposalInfo) return null;
      return getProposalStatus(proposalInfo);
    },
    {
      enabled: !!proposalInfo,
      refetchInterval: refetchInterval,
    }
  );

  return query.data as ProposalStatus | null;
};

export const useProposalStateQuery = (
  proposalAddress: string,
  refetchInterval: number = STATE_REFETCH_INTERVAL
) => {
  const { setEndpointError } = useEnpointModal();
  const isCustomEndpoint = useIsCustomEndpoint();
  const proposalStatus = useProposalStatusQuery(proposalAddress);
  const queryKey = useGetQueryKey([QueryKeys.STATE, proposalAddress]);
  const queryClient = useQueryClient();
  const voteFinished = proposalStatus === ProposalStatus.CLOSED;
  const { getLatestMaxLtAfterTx, setLatestMaxLtAfterTx } =
    useAppPersistedStore();

  const { refetch: fetchProposalInfo } = useProposalInfoQuery(proposalAddress);

  return useQuery(
    queryKey,
    async () => {
      const { data: proposalInfo } = await fetchProposalInfo();

      if (!proposalInfo) throw new Error("Missing proposal info");

      const state = queryClient.getQueryData(queryKey) as ProposalState | null;

      const getContractState = () => {
        return contract.getState(proposalAddress, proposalInfo, state);
      };

      if (isCustomEndpoint) {
        Logger("custom endpoint, fetching from contract");
        return getContractState();
      }
      const serverState = await server.getState(
        proposalAddress,
        getLatestMaxLtAfterTx(proposalAddress)
      );
      if (serverState) {
        setLatestMaxLtAfterTx(proposalAddress, undefined);
      }
      return serverState || getContractState();
    },
    {
      onError: () => setEndpointError(true),
      refetchInterval: !voteFinished ? refetchInterval : undefined,
      staleTime: voteFinished ? Infinity : 2_000,
    }
  );
};

export const useServerLastFetchUpdateValidationQuery = () => {
  const { setEndpointError } = useEnpointModal();
  return useQuery(
    [QueryKeys.SERVER_VALIDATION],
    () => server.validateServerLastUpdate(),
    {
      refetchInterval: 20_000,
      // TODO, maybe set custom endpoint
      onError: () => setEndpointError(true),
      onSuccess: (isValid) => {
        if (!isValid) setEndpointError(true);
      },
    }
  );
};

const useGetQueryKey = (key: string[]): QueryKey => {
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();
  return [...key, clientV2Endpoint, clientV4Endpoint];
};
