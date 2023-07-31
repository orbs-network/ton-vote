import { useMutation } from "@tanstack/react-query";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useFormatNumber } from "hooks/hooks";
import _, { rest } from "lodash";
import {
  useGetClientsCallback,
  useReadNftItemMetadataCallback,
} from "query/getters";
import { useEffect, useMemo } from "react";
import { showSuccessToast, useErrorToast } from "toasts";
import { toNano } from "ton-core";
import { transferJettons, transferNft } from "ton-vote-contracts-sdk";
import {
  useAirdropPersistStore,
  useAssetSelectStore,
  useVotersSelectStore,
} from "./store";
import { Steps } from "./types";

export const useDisplayWalletIndex = () => {
  const res = useAirdropPersistStore().currentWalletIndex || 0;
  return res + 1;
};

export const useAmountPerWallet = () => {
  const { jettonsAmount, assetType, voters } = useAirdropPersistStore();

  const amountPerWallet = useMemo(() => {
    const amount = jettonsAmount || 0;

    return assetType === "jetton" ? Math.floor(amount / _.size(voters)) : 1;
  }, [jettonsAmount, _.size(voters), assetType]);

  const amountPerWalletUI = useFormatNumber(amountPerWallet);

  return { amountPerWallet, amountPerWalletUI };
};

export const useAmount = () => {
  const { jettonsAmount, assetType, voters } = useAirdropPersistStore();

  const amount = useMemo(() => {
    return assetType === "jetton" ? jettonsAmount : _.size(voters);
  }, [jettonsAmount, _.size(voters), assetType]);

  const amountUI = useFormatNumber(amount);

  return { amount, amountUI };
};

export const useNextVoter = () => {
  const { currentWalletIndex, voters } = useAirdropPersistStore();
  return !voters ? undefined : voters[currentWalletIndex || 0];
};

export const useTransferJetton = () => {
  const { amountPerWallet } = useAmountPerWallet();
  const { jettonAddress } = useAirdropPersistStore();
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  const onSuccess = useOnTransferSuccess();
  const nextVoter = useNextVoter();
  const getClients = useGetClientsCallback();

  return useMutation(
    async () => {
      if (!jettonAddress) {
        throw new Error("No jetton address found");
      }
      const clientV2 = (await getClients()).clientV2;
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
  } = useAirdropPersistStore();

  return () => {
    incrementCurrentWalletIndex();
    if (currentWalletIndex + 1 >= _.size(voters)) {
      nextStep();
    }
  };
};

export const useTransferNFT = () => {
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  const onSuccessCallback = useOnTransferSuccess();
  const voter = useNextVoter();
  const getClients = useGetClientsCallback();
  const { setNFTItemsRecipients } = useAirdropPersistStore();
  const getMetadata = useReadNftItemMetadataCallback();
  const connectedWallet = useTonAddress();

  return useMutation(
    async ({
      NFTItemAddress,
    }: {
      NFTItemAddress: string;
      onSuccess: () => void;
    }) => {
      if (!voter) {
        throw new Error("No next voter found");
      }
      const metadata = await getMetadata(NFTItemAddress);
      const isOwner = metadata?.nftItemOwner.toString() === connectedWallet;
      if (!isOwner) {
        throw new Error("You are not owner of this NFT");
      }
      const clientV2 = (await getClients()).clientV2;
      return transferNft(clientV2, tonconnect, NFTItemAddress, voter);
    },
    {
      onSuccess: (_, args) => {
        showSuccessToast(`Successfully transferred NFT`);
        onSuccessCallback();
        setNFTItemsRecipients(voter!, args.NFTItemAddress);
        args.onSuccess();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

export const useAirdropStarted = () => {
  const index = useAirdropPersistStore().currentWalletIndex || 0;

  return index > 0;
};

export const useValidateChangedAfterAirdropStarted = () => {
  const started = useAirdropStarted();
  const persistStore = useAirdropPersistStore();
  const assetSelectStore = useAssetSelectStore();
  const votersSelectStore = useVotersSelectStore();


  return () => {
    if (!started) return false;
    if (persistStore.step === Steps.SELECT_ASSET_TYPE) {
      return !_.isEqual(
        {
          assetType: assetSelectStore.assetType,
          jettonsAmount: assetSelectStore.jettonsAmount,
          jettonAddress: assetSelectStore.jettonAddress,
        },
        {
          assetType: persistStore.assetType,
          jettonsAmount: persistStore.jettonsAmount,
          jettonAddress: persistStore.jettonAddress,
        }
      );
    }
    if (persistStore.step === Steps.SELECT_VOTERS) {
      return !_.isEqual(
        {
          votersAmount: votersSelectStore.votersAmount,
          daos: votersSelectStore.daos,
          proposals: votersSelectStore.proposals,
          selectionMethod: votersSelectStore.selectionMethod,
          manuallySelectedVoters: votersSelectStore.manuallySelectedVoters,
        },
        {
          votersAmount: persistStore.votersAmount,
          daos: persistStore.daos,
          proposals: persistStore.proposals,
          selectionMethod: persistStore.selectionMethod,
          manuallySelectedVoters: persistStore.manuallySelectedVoters,
        }
      );
    }
    return false;
  };
};

export const useRevertAirdropChanges = () => {
  const persistStore = useAirdropPersistStore();
  const assetSelectStore = useAssetSelectStore();
  const votersSelectStore = useVotersSelectStore();
  return () => {
    if (persistStore.step === Steps.SELECT_ASSET_TYPE) {
      assetSelectStore.reset();
    }
    if (persistStore.step === Steps.SELECT_VOTERS) {      
      votersSelectStore.reset();
    }
  };
};
