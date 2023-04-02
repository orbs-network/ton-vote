import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useNotification } from "components";
import { useGetSender } from "hooks";
import { getContractState } from "lib";
import _ from "lodash";
import { Address } from "ton-core";
import { MetadataArgs, getProposalInfo, ProposalMetadata } from "ton-vote-npm";
import {  ProposalState } from "types";
import { Logger } from "utils";
import { useClientsQuery, useProposalStateQuery } from "./queries";
import * as TonVoteContract from 'ton-vote-npm'

export const useCreateProposal = () => {
  const getSender = useGetSender();
  const clientV2 = useClientsQuery()?.clientV2;
  const { showNotification } = useNotification();

  return useMutation(
    async ({
      daoAddr,
      proposalMetadata,
    }: {
      daoAddr: string;
      proposalMetadata: ProposalMetadata;
    }) => {
      const sender = getSender();

      return TonVoteContract.newProposal(
        sender,
        clientV2!,
        Address.parse(daoAddr),
        proposalMetadata
      );
    },
    {
      onSuccess: () => {
        showNotification({ variant: "success", message: "Proposal created" });
      },
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
    return null
  })  
  
};



export const useJoinDao = () => {
    const getSender = useGetSender();

  return useMutation(async () => {
    const sender = getSender();
    return null;
  })
}