import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "config";
import { contract, server } from "data-service";
import { useIsCustomEndpoint } from "hooks";
import { useAppPersistedStore } from "store";

export const useDaoMetadataQuery = (address: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  return useQuery(
    [QueryKeys.DAO_METADATA, address, clientV2Endpoint, clientV4Endpoint],
    async () => {
      if (isCustomEndpoint) {
        return contract.getDaoMetadata(address);
      }
      return server.getDaoMetadata(address);
    }
  );
};

export const useDaosQuery = () => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  return useQuery(
    [QueryKeys.DAOS, clientV2Endpoint, clientV4Endpoint],
    async () => {
      if (isCustomEndpoint) {
        return contract.getDaos();
      }
      return server.getDaos();
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useDaoRolesQuery = (daoAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  return useQuery(
    [QueryKeys.DAO_ROLES, daoAddress, clientV2Endpoint, clientV4Endpoint],
    () => {
      if (isCustomEndpoint) {
        return contract.getDaoRoles(daoAddress);
      }
      return server.getDaoRoles(daoAddress);
    }
  );
};

export const useDaoProposalsQuery = (daoAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();
  return useQuery(
    [QueryKeys.DAO_PROPOSALS, daoAddress, clientV2Endpoint, clientV4Endpoint],
    () => {
      if (isCustomEndpoint) {
        return contract.getDaoProposals(daoAddress);
      } else {
        return server.getDaoProposals(daoAddress);
      }
    }
  );
};

export const useDaoProposalMetadataQuery = (
  daoAddress: string,
  proposalAddress: string
) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();
  return useQuery(
    [
      QueryKeys.DAO_PROPOSAL,
      daoAddress,
      proposalAddress,
      clientV2Endpoint,
      clientV4Endpoint,
    ],
    () => {
      if (isCustomEndpoint) {
        return contract.getDapProposalMetadata(daoAddress, proposalAddress);
      } else {
        server.getDapProposalMetadata(daoAddress, proposalAddress);
      }
    }
  );
};

export const useProposalInfoQuery = (proposalAddress: string) => {
  const isCustomEndpoint = useIsCustomEndpoint();
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  return useQuery(
    [
      QueryKeys.DAO_PROPOSAL_INFO,
      proposalAddress,
      clientV2Endpoint,
      clientV4Endpoint,
    ],
    () => {
      if (isCustomEndpoint) {
        return contract.getDaoProposalInfo(proposalAddress);
      } else {
        server.getDaoProposalInfo(proposalAddress);
      }
    },
    {
      staleTime: Infinity,
    }
  );
};
