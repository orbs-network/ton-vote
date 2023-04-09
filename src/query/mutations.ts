import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useDaoAddress, useGetSender } from "hooks";
import { getContractState } from "lib";
import _ from "lodash";
import { Address } from "ton-core";
import { MetadataArgs, getProposalInfo, ProposalMetadata } from "ton-vote-sdk";
import { ProposalState } from "types";
import { Logger } from "utils";
import { useClientsQuery, useProposalStateQuery } from "./queries";
import * as TonVoteContract from "ton-vote-sdk";
import { showPromiseToast } from "toasts";
import { useAppNavigation } from "router";

export const useCreateProposal = () => {
  const daoAddress = useDaoAddress()
  const getSender = useGetSender();
  const clientV2 = useClientsQuery()?.clientV2;
  const appNavigation = useAppNavigation();

  return useMutation(
    async ({
      daoAddr,
      proposalMetadata,
    }: {
      daoAddr: string;
      proposalMetadata: ProposalMetadata;
    }) => {
      const sender = getSender();

      const promise = TonVoteContract.newProposal(
        sender,
        clientV2!,
        Address.parse(daoAddr),
        proposalMetadata
      );

      showPromiseToast({
        promise,
        loading: "Create proposal transaction pending...",
        success: "Proposal created",
      });

      const address = await promise;
      console.log({ address });
      
      if (Address.isAddress(address)) {
        appNavigation.proposalPage.root(daoAddress, address.toString());
      } else {
        throw new Error("Proposal address is not valid");
      }
    }
  );
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
      Address.parse(proposalAddress)
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

export const useVote = () => {
  const getSender = useGetSender();
  return useMutation(async () => {
    const sender = getSender();
    return null;
  });
};

export const useJoinDao = () => {
  const getSender = useGetSender();

  return useMutation(async () => {
    const sender = getSender();
    return null;
  });
};
