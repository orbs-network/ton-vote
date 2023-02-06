import { useMutation } from "@tanstack/react-query";
import { votingContract, TX_FEE, voteOptions } from "config";
import _ from "lodash";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import { useConnection, useWalletAddress, useClient } from "store";
import { Cell, CommentMessage, Address, toNano, fromNano } from "ton";
import { Provider, Vote } from "types";
import {
  waitForSeqno,
  getAdapterName,
  unshiftWalletVote,
  localStorageVoteKey,
  getVoteFromLocalStorage,
} from "utils";
import { useStateData, useProposalInfoQuery } from "./queries";

export const useSendTransaction = () => {
  const connection = useConnection();
  const address = useWalletAddress();
  const { clientV2 } = useClient();
  const [txApproved, setTxApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const addVoteManually = useAddVoteManually();
  const query = useMutation(
    async ({ value }: { value: "yes" | "no" | "abstain" }) => {
      const cell = new Cell();
      new CommentMessage(value).writeTo(cell);
      setIsLoading(true);

      const waiter = await waitForSeqno(
        clientV2!.openWalletFromAddress({
          source: Address.parse(address!),
        })
      );
      const onSuccess = async () => {
        setTxApproved(true);
        await waiter();
        await addVoteManually(value);
        setTxApproved(false);
        setIsLoading(false);
      };

      const isExtension = getAdapterName() === Provider.EXTENSION;

      if (isMobile || isExtension) {
        await connection?.requestTransaction({
          to: votingContract,
          value: toNano(TX_FEE),
          message: cell,
        });
        await onSuccess();
      } else {
        await connection?.requestTransaction(
          {
            to: votingContract,
            value: toNano(TX_FEE),
            message: cell,
          },
          onSuccess
        );
      }
    },
    {
      onError: () => {
        setIsLoading(false);
        setTxApproved(false);
      },
    }
  );

  return {
    ...query,
    txApproved,
    isLoading,
  };
};

export const useGetAddressVotingPower = () => {
  const clientV4 = useClient().clientV4;
  const mcSnapshotBlock = useProposalInfoQuery().data?.snapshot.mcSnapshotBlock;
  return useMutation(async ({ address }: { address: string }) => {
    if (!address || !mcSnapshotBlock || !clientV4) return;
    return (
      await clientV4.getAccountLite(
        Number(mcSnapshotBlock),
        Address.parse(address)
      )
    ).account.balance.coins;
  });
};

const useAddVoteManually = () => {
  const walletAddress = useWalletAddress();
  const { mutateAsync: getVotingPower } = useGetAddressVotingPower();
  const { getData, setData } = useStateData();

  return async (value: string) => {
    const votingPower = await getVotingPower({ address: walletAddress! });
    const name = voteOptions.find((it) => it.value === value)?.name;
    if (!name) return;
    const vote = {
      address: walletAddress!,
      vote: name,
      timestamp: 0,
      votingPower: votingPower ? fromNano(votingPower) : "0",
    };

    const localStorageKey = localStorageVoteKey(walletAddress!);
    localStorage.setItem(localStorageKey, JSON.stringify(vote));

    const data = getData();
    if (!data) return;
    const votes = unshiftWalletVote(data?.votes || [], walletAddress!, vote);

    data.votes = votes;
    setData(data);

    return vote;
  };
};

export const useUnshiftConnectedWalletVote = () => {
  const walletAddress = useWalletAddress();

  return (votes: Vote[]) => {
    if (!walletAddress) return votes;

    const voteFromList = votes.find((it) => it.address === walletAddress);

    const vote = voteFromList || getVoteFromLocalStorage(walletAddress!);

    if (vote) {
      votes = unshiftWalletVote(votes, walletAddress!, vote);
    }

    return votes;
  };
};
