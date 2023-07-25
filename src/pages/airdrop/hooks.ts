import { useMutation, useQuery } from "@tanstack/react-query";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useFormatNumber } from "hooks/hooks";
import _ from "lodash";
import {
  useEnsureAssetMetadataQuery,
  useGetAllProposalsCallback,
} from "query/getters";
import { useMemo } from "react";
import { showSuccessToast, useErrorToast } from "toasts";
import { toNano } from "ton-core";
import {
  chooseRandomVoters,
  getClientV2,
  getClientV4,
  transferJettons,
  transferNft,
} from "ton-vote-contracts-sdk";
import { useAirdropStore } from "./store";
import { AirdropForm } from "./types";

export const useAirdropVotersQuery = () => {
  const getVotes = useGetAirdropVotes();

  return useQuery(["useAirdropVotersQuery"], async () => {
    const votes = await getVotes();
    return _.keys(votes);
  });
};

export const useGetAirdropVotes = () => {
  const getProposals = useGetAllProposalsCallback();
  const { proposals } = useAirdropStore();

  return async () => {
    const result = await getProposals(proposals);

    let votes = {};
    result.forEach((proposal) => {
      votes = {
        ...votes,
        ...proposal?.rawVotes,
      };
    });

    return votes;
  };
};

export const useSetupAirdrop = () => {
  const errorToast = useErrorToast();
  const { initAirdrop, nextStep } = useAirdropStore();
  const getVotes = useGetAirdropVotes();

  return useMutation(
    async (formData: AirdropForm) => {
      if (formData.votersSelectionMethod === 2) {
        return formData.manualVoters;
      }

      const amount = formData.walletsAmount || 0;
      const clientV4 = await getClientV4();

      const votes = await getVotes();

      if (!votes) {
        throw new Error("Something went wrong");
      }

      if (_.size(votes) < amount) {
        throw new Error(
          `Max amount of voters in ${_.size(votes).toLocaleString()}`
        );
      }

      const result = await chooseRandomVoters(clientV4, votes, amount);

      if (_.size(result) === 0) {
        throw new Error("Something went wrong");
      }
      return result;
    },
    {
      onSuccess: (voters, args) => {
        initAirdrop({
          voters,
          jettonAddress: args.address!,
          jettonsAmount: args.assetAmount!,
          type: args.type!,
          votersSelectionMethod: args.votersSelectionMethod!,
        });
        nextStep();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

export const useAmountPerWallet = () => {
  const { jettonsAmount, type, voters } = useAirdropStore();

  const amountPerWallet = useMemo(() => {
    const amount = jettonsAmount || 0;
    return type === "jetton" ? Math.floor(amount / _.size(voters)) : 1;
  }, [jettonsAmount, _.size(voters), type]);

  const amountPerWalletUI = useFormatNumber(amountPerWallet);

  return { amountPerWallet, amountPerWalletUI };
};

export const useAmount = () => {
  const { jettonsAmount, type, voters } = useAirdropStore();

  const amount = useMemo(() => {
    return type === "jetton" ? jettonsAmount : _.size(voters);
  }, [jettonsAmount, _.size(voters), type]);

  const amountUI = useFormatNumber(amount);

  return { amount, amountUI };
};

export const useNextVoter = () => {
  const { currentWalletIndex, voters } = useAirdropStore();
  return !voters ? undefined : voters[currentWalletIndex || 0];
};

export const useTransferJetton = () => {
  const { amountPerWallet } = useAmountPerWallet();
  const { jettonAddress, voters } = useAirdropStore();
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  const onSuccess = useOnTransferSuccess();
  const nextVoter = useNextVoter();

  return useMutation(
    async () => {
      if (!jettonAddress) {
        throw new Error("No jetton address found");
      }
      const clientV2 = await getClientV2();
      if (!nextVoter) {
        throw new Error("No next voter found");
      }
      return transferJettons(
        clientV2,
        tonconnect,
        toNano(amountPerWallet),
        jettonAddress,
        nextVoter
      );
    },
    {
      onSuccess: async (args) => {
        showSuccessToast(`Successfully transfered jetton`);
        onSuccess();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

const useOnTransferSuccess = () => {
  const {
    incrementCurrentWalletIndex,
    nextStep,
    currentWalletIndex = 0,
    voters,
  } = useAirdropStore();

  return () => {
    console.log(currentWalletIndex, _.size(voters));

    incrementCurrentWalletIndex();
    if (currentWalletIndex + 1 >= _.size(voters)) {
      nextStep();
    }
  };
};

export const useTransferNFT = () => {
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  const onSuccess = useOnTransferSuccess();
  const nextVoter = useNextVoter();

  return useMutation(
    async (nftAddress: string) => {
      if (!nextVoter) {
        throw new Error("No next voter found");
      }
      const clientV2 = await getClientV2();
      return transferNft(clientV2, tonconnect, nftAddress, nextVoter);
    },
    {
      onSuccess: () => {
        showSuccessToast(`Successfully transferred NFT`);
        onSuccess();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};
