import { useMutation } from "@tanstack/react-query";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useAppParams, useFormatNumber } from "hooks/hooks";
import _ from "lodash";
import { useEnsureAssetMetadataQuery, useProposalQuery } from "query/getters";
import { useMemo } from "react";
import { AirdropInterface, useAirdropStore } from "store";
import { showSuccessToast, useErrorToast } from "toasts";
import { toNano } from "ton-core";
import {
  chooseRandomVoters,
  getClientV2,
  getClientV4,
  transferJettons,
  transferNft,
} from "ton-vote-contracts-sdk";
import { AirdropForm } from "./form";

export const useAirdrop = () => {
  const { proposalAddress } = useAppParams();
  const { airdrops, update, reset } = useAirdropStore();
  const _airdrop = airdrops[proposalAddress];
  const voters = _airdrop?.wallets || [];
  const currentWalletIndex = _airdrop?.currentWalletIndex || 0;
  return useMemo(() => {
    return {
      type: _airdrop?.type,
      airdropExist: !!_airdrop,
      voters,
      currentWalletIndex,
      jettonAddress: _airdrop?.jettonAddress,
      amount:
        _airdrop?.type === "jetton" ? _airdrop?.jettonsAmount : _.size(voters),
      amountPerWallet:
        _airdrop?.type === "jetton"
          ? Math.floor((_airdrop?.jettonsAmount || 0) / _.size(voters))
          : 1,
      votersCount: _.size(voters),
      nextVoter: voters[currentWalletIndex],
      reset: () => reset(proposalAddress),
      updateAirdrop: (args: Partial<AirdropInterface>) =>
        update(proposalAddress, args),
      incrementCurrentWalletIndex: () => {
        update(proposalAddress, {
          currentWalletIndex: currentWalletIndex + 1,
        });
      },
      finished: currentWalletIndex >= _.size(voters),
    };
  }, [_airdrop, update, reset, proposalAddress]);
};

export const useCreateAirdrop = () => {
  const errorToast = useErrorToast();
  const { updateAirdrop } = useAirdrop();
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const rawVotesCount = useFormatNumber(_.size(data?.rawVotes));

  return useMutation(
    async (formData: AirdropForm) => {
      const amount = formData.walletsAmount || 0;
      const clientV4 = await getClientV4();
      if (!data?.rawVotes) {
        throw new Error("No votes found");
      }

      if (_.size(data.rawVotes) < amount) {
        throw new Error(`Max amount of voters in ${rawVotesCount}`);
      }

      const result = await chooseRandomVoters(clientV4, data!.rawVotes, amount);
      if (_.size(result) === 0) {
        throw new Error("Something went wrong");
      }
      return result;
    },
    {
      onSuccess: (wallets, args) => {

        updateAirdrop({
          wallets,
          jettonAddress: args.address,
          jettonsAmount: args.assetAmount,
          type: args.type,
        });
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

export const useTransferJetton = () => {
  const {
    amountPerWallet,
    jettonAddress,
    nextVoter,
    incrementCurrentWalletIndex,
  } = useAirdrop();
  const amountPerWalletUI = useFormatNumber(amountPerWallet);
  const prefetchAssetMetadata = useEnsureAssetMetadataQuery();
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  return useMutation(
    async () => {
      if (!jettonAddress) {
        throw new Error("No jetton address found");
      }
      const clientV2 = await getClientV2();

      // return transferJettons(
      //   clientV2,
      //   tonconnect,
      //   toNano(amountPerWallet),
      //   jettonAddress,
      //   nextVoter
      // );
    },
    {
      onSuccess: async (args) => {
        const result: any = await prefetchAssetMetadata(jettonAddress!);

        showSuccessToast(
          `Successfully sent ${amountPerWalletUI} ${result?.metadata?.symbol}`
        );
        incrementCurrentWalletIndex();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

export const useTransferNFT = () => {
  const { nextVoter, incrementCurrentWalletIndex } = useAirdrop();
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  return useMutation(
    async (nftAddress: string) => {
      const clientV2 = await getClientV2();
      // return transferNft(clientV2, tonconnect, nftAddress, nextVoter);
    },
    {
      onSuccess: () => {
        showSuccessToast(`Successfully transferred NFT`);
        incrementCurrentWalletIndex();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};
