import { useMutation } from "@tanstack/react-query";
import analytics from "analytics";
import { useDaoAddress, useGetSender } from "hooks";
import { getContractState } from "lib";
import _ from "lodash";
import TonConnect from "@tonconnect/sdk";
import { Address, beginCell, Cell, toNano } from "ton-core";
import { getProposalInfo, ProposalMetadata } from "ton-vote-sdk";
import { ProposalState } from "types";
import { Logger } from "utils";
import { useClientsQuery, useProposalStateQuery } from "./queries";
import * as TonVoteSDK from "ton-vote-sdk";
import { showPromiseToast } from "toasts";
import { useAppNavigation } from "router";
import { TON_CONNECTOR, TX_FEE } from "config";
import TonWeb from "tonweb";

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

export const useVote = (proposalAddress: string) => {
  const getSender = useGetSender();
  return useMutation(
    async (vote: string) => {
      const sender = getSender;
    },
    {
      onError: (error) => console.log(error),
    }
  );
};

export const useJoinDao = () => {
  const getSender = useGetSender();

  return useMutation(async () => {
    const sender = getSender();
    return null;
  });
};
