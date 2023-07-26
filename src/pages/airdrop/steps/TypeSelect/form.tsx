import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { AirdropStoreKeys } from "pages/airdrop/types";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { AirdropForm } from "../../store";

export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object<AirdropForm>().shape({
    [AirdropStoreKeys.assetType]: Yup.string().required(
      commonTranslations.isRequired("Asset type")
    ),

    [AirdropStoreKeys.jettonAddress]: Yup.string()
      .test(
        "",
        commonTranslations.isRequired("Jetton address"),
        (value, context) => {
          if (context.parent[AirdropStoreKeys.assetType] === "jetton") {
            return !!value;
          }
          return true;
        }
      )
      .test("", "Invalid jetton address", (value, context) => {
        if (context.parent[AirdropStoreKeys.assetType] === "jetton") {
          return validateAddress(value);
        }
        return validateAddress(value);
      }),
    [AirdropStoreKeys.jettonsAmount]: Yup.string().test(
      "",
      commonTranslations.isRequired("Total jettons amount"),
      (value, context) => {
        if (context.parent[AirdropStoreKeys.assetType] === "jetton") {
          return !!value;
        }
        return true;
      }
    ),
  });
};

export const useForm = (values: AirdropForm): FormArgs<AirdropForm> => {
  return useMemo(() => {
    let inputs: InputArgs<AirdropForm>[] = [
      {
        name: AirdropStoreKeys.assetType,
        label: "Airdrop asset type",
        type: "radio",
        required: true,
        selectOptions: [
          { value: "nft", text: "NFT" },
          { value: "jetton", text: "Jetton" },
        ],
      },
    ];

    const nftInput: InputArgs<AirdropForm> = {
      name: AirdropStoreKeys.nftCollection,
      label: "NFT collection address",
      type: "text",
      required: true,
    };

    const jettonsInputs: InputArgs<AirdropForm>[] = [
      {
        name: AirdropStoreKeys.jettonAddress,
        label: "Jetton wallet address",
        type: "text",
        required: true,
        helperText: "Some text",
      },
      {
        name: AirdropStoreKeys.jettonsAmount,
        label: "Total jettons amount",
        type: "number",
        required: true,
      },
    ];

    if (values.assetType === "jetton") {
      inputs = [...inputs, ...jettonsInputs];
    }
    return {
      inputs,
    };
  }, [values.jettonAddress, values.nftCollection, values.assetType]);
};
