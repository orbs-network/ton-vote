import { useMutation } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";
import { useAirdropStore } from "pages/airdrop/store";
import { useReadJettonWalletMedataCallback } from "query/getters";
import { useErrorToast } from "toasts";
import { toNano } from "ton-core";
import { TypeSelectForm } from "./form";

export const useOnAssetTypeSelected = () => {
  const getMetadata = useReadJettonWalletMedataCallback();
  const showError = useErrorToast();
  const connectedWallet = useTonAddress();
  const { nextStep, setValues } = useAirdropStore();

  return useMutation(
    async (values: TypeSelectForm) => {
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
        nextStep();
        setValues({
          assetType: values.assetType,
          jettonAddress: values.jettonAddress,
          jettonsAmount: values.jettonsAmount,
        });
      },
      onError: (err) => {
        showError(err);
      },
    }
  );
};
