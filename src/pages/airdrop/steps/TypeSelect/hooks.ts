import { useMutation } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";
import { AssetSelectValues, useAirdropPersistStore } from "pages/airdrop/store";
import { useReadJettonWalletMedataCallback } from "query/getters";
import { useErrorToast } from "toasts";
import { toNano } from "ton-core";

export const useOnAssetTypeSelected = () => {
  const getMetadata = useReadJettonWalletMedataCallback();
  const showError = useErrorToast();
  const connectedWallet = useTonAddress();
  const persistStore = useAirdropPersistStore();

  return useMutation(
    async (values: AssetSelectValues) => {
      if (values.assetType === "jetton") {
        if (!values.jettonAddress) {
          throw new Error("No jetton address found");
        }
        const metadata = await getMetadata(values.jettonAddress);
        if (metadata.ownerAddress.toString() !== connectedWallet) {
          throw new Error("You must be owner of this jetton wallet");
        }
        const haveBalance =
          metadata.jettonWalletBalance >=
          toNano(Math.floor(values.jettonsAmount || 0));

        if (!haveBalance) {
          throw new Error("You don't have enough jetton balance");
        }
      }
    },
    {
      onSuccess: (_, values) => {
        persistStore.setValues({
          assetType: values.assetType,
          jettonAddress: values.jettonAddress,
          jettonsAmount: values.jettonsAmount,
        });
        persistStore.nextStep();
      },
      onError: (err) => {
        showError(err);
      },
    }
  );
};
