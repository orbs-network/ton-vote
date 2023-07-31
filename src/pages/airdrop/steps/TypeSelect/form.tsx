import { useFormik } from "formik";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { AssetSelectValues, useAssetSelectStore } from "pages/airdrop/store";
import { AirdropStoreKeys } from "pages/airdrop/types";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { useOnAssetTypeSelected } from "./hooks";



export const useTypeSelectFormik = () => {
  const { mutate } = useOnAssetTypeSelected();

  const onSubmit = (values: AssetSelectValues) => {
    mutate({
      assetType: values.assetType,
      jettonAddress: values.jettonAddress,
      jettonsAmount: values.jettonsAmount,
    });
  };

  const store = useAssetSelectStore();
  const schema = useFormSchema();
  return useFormik<AssetSelectValues>({
    enableReinitialize: true,
    initialValues: {
      [AirdropStoreKeys.jettonsAmount]: store.jettonsAmount,
      [AirdropStoreKeys.jettonAddress]: store.jettonAddress,
      [AirdropStoreKeys.assetType]: store.assetType,
    },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });
};

export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object().shape({
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

export const useForm = (values: AssetSelectValues): FormArgs<AssetSelectValues> => {
  const t = useAirdropTranslations();
  return useMemo(() => {
    let inputs: InputArgs<AssetSelectValues>[] = [
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

    const jettonsInputs: InputArgs<AssetSelectValues>[] = [
      {
        name: AirdropStoreKeys.jettonAddress,
        label: t.jettonWalletAddress.title,
        type: "text",
        required: true,
        tooltip: t.jettonWalletAddress.tooltip,
      },
      {
        name: AirdropStoreKeys.jettonsAmount,
        label: t.totalJettonAmount.title,
        type: "number",
        required: true,
        tooltip: t.totalJettonAmount.tooltip,
      },
    ];

    if (values.assetType === "jetton") {
      inputs = [...inputs, ...jettonsInputs];
    }
    return {
      inputs,
    };
  }, [values.jettonAddress, values.assetType]);
};
