import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKeys } from "config";
import { api, getDao, getDaos } from "lib";
import { ProposalStatus } from "types";
import _ from "lodash";
import { ProposalMetadata } from "ton-vote-sdk";
import { getProposalStatus } from "utils";

export const useDaosQuery = () => {
  return useInfiniteQuery({
    queryKey: [QueryKeys.DAOS],
    queryFn: async ({ pageParam, signal }) => {
      const nextPage = pageParam ? Number(pageParam) : undefined;

      return getDaos(nextPage, signal);
    },
    staleTime: Infinity,
    getNextPageParam: (lastPage) =>
      lastPage.nextId === -1 ? undefined : lastPage.nextId,
  });
};

export const useDaoQuery = (daoAddress: string, enabled?: boolean) => {
  const queryClient = useQueryClient();

  return useQuery(
    [QueryKeys.DAO_METADATA, daoAddress],
    ({ signal }) => getDao(queryClient, daoAddress, signal),
    {
      enabled: !!enabled,
    }
  );
};

export const useDaoProposalsQuery = (daoAddress: string) => {
  return useInfiniteQuery({
    queryKey: [QueryKeys.PROPOSALS, daoAddress],
    queryFn: async ({ pageParam, signal }) => {
      const nextPage = pageParam ? Number(pageParam) : undefined;
      return api.getProposals(daoAddress, nextPage, signal);
      // try {

      // } catch (error) {
      // const client = await getClientV2();
      // const client4 = await getClientV4();
      // const { proposalAddresses, endProposalId } =
      //   await TonVoteSDK.getDaoProposals(client, daoAddress, nextPage, 10);

      // const proposals: Proposal[] = await Promise.all(
      //   proposalAddresses ||
      //     [].map(async (address) => {
      //       return {
      //         proposalAddr: address,
      //         metadata: await TonVoteSDK.getProposalInfo(
      //           client,
      //           client4,
      //           address
      //         ),
      //       };
      //     })
      // );
      // return {
      //   proposals,
      //   nextId: endProposalId,
      // };
      // }
    },
    enabled: !!daoAddress,
    getNextPageParam: (lastPage) => lastPage.nextId,
  });
};

export const useProposalStatusQuery = (
  proposalMetadata?: ProposalMetadata,
  proposalAddress?: string
) => {
  const query = useQuery(
    [QueryKeys.PROPOSAL_TIMELINE, proposalAddress],
    () => getProposalStatus(proposalMetadata!),
    {
      refetchInterval: 2_000,
      enabled: !!proposalMetadata && !!proposalAddress,
    }
  );

  return query.data as ProposalStatus | null;
};
