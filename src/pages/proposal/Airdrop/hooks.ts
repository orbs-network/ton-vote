import { useMutation } from "@tanstack/react-query";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useAppParams, useFormatNumber } from "hooks/hooks";
import _ from "lodash";
import {
  useAssetMetadataQuery,
  useEnsureAssetMetadataQuery,
  useProposalQuery,
} from "query/getters";
import { AirdropUpdateKey, useAirdropStore } from "store";
import { showSuccessToast, useErrorToast } from "toasts";
import { toNano } from "ton-core";
import {
  chooseRandomVoters,
  getClientV2,
  getClientV4,
  transferJettons,
  transferNft,
} from "ton-vote-contracts-sdk";

export const useAirdrop = () => {
  const { proposalAddress } = useAppParams();
  const store = useAirdropStore();
  const _airdrop = store.airdrops[proposalAddress];
  const amount = _airdrop?.amount || 0;
  const wallets = _airdrop?.wallets || [];
  const amountPerWallet = Math.floor(amount / _.size(wallets));
  const amountPerWalletUI = useFormatNumber(amountPerWallet);
  const amountUI = useFormatNumber(amount);
  const walletsCountUI = useFormatNumber(_.size(wallets));

  return {
    airdropExist: !!_airdrop,
    wallets,
    currentWalletIndex: _airdrop?.currentWalletIndex || 0,
    assetAddress: _airdrop?.address || "",
    amount,
    amountUI,
    amountPerWallet,
    amountPerWalletUI,
    walletsCountUI,
    walletCount: _.size(wallets),
    reset: () => store.reset(proposalAddress),
    updateAirdrop: (key: AirdropUpdateKey, value: any) =>
      store.update(proposalAddress, key, value),
  };
};

export const useAirdropAssetMetadata = () => {
  const { assetAddress } = useAirdrop();

  return useAssetMetadataQuery(assetAddress);
};

export const useGetAirdropWallets = () => {
  const { updateAirdrop } = useAirdrop();
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  return useMutation(
    async (amount: number) => {
      const clientV4 = await getClientV4();
      if (!data!.rawVotes) {
        throw new Error("No votes found");
      }
       if (data!.rawVotes) {
         throw new Error("No votes found");
       }
      return chooseRandomVoters(clientV4, data!.rawVotes, amount);
    },
    {
      onSuccess: (wallets) => {
        updateAirdrop("wallets", wallets);
      },
    }
  );
};

export const useTransfer = () => {
  const { amountPerWallet, assetAddress, amountPerWalletUI } = useAirdrop();
  const prefetchAssetMetadata = useEnsureAssetMetadataQuery();
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  return useMutation(
    async (toAddress: string) => {
      const result: any = await prefetchAssetMetadata(assetAddress);

      const type = result.type;
      console.log(type);

      if (!type) {
        throw new Error("Asset type not found");
      }

      const method = type === "Jetton" ? transferJettons : transferNft;
      const clientV2 = await getClientV2();
      const balance = await transferJettons(
        clientV2,
        tonconnect,
        toNano(amountPerWallet),
        assetAddress,
        toAddress
      );
      return balance;
    },
    {
      onSuccess: (_, toAddress) =>
        showSuccessToast(
          `Successfully transferred ${amountPerWalletUI} to ${toAddress}`
        ),
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};
