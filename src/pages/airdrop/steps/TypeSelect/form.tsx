import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { JettonImg, NFTImg } from "pages/airdrop/Components";
import { AirdropFormsKeys } from "pages/airdrop/store";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { AirdropAssetImg } from "../../AirdropAssetImg";
import { AirdropForm } from "../../store";

export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object<AirdropForm>().shape({
    [AirdropFormsKeys.assetType]: Yup.string().required(
      commonTranslations.isRequired("Asset type")
    ),

    [AirdropFormsKeys.jettonAddress]: Yup.string()
      .test(
        "",
        commonTranslations.isRequired("Jetton address"),
        (value, context) => {
          if (context.parent[AirdropFormsKeys.assetType] === "jetton") {
            return !!value;
          }
          return true;
        }
      )
      .test("", "Invalid jetton address", (value, context) => {
        if (context.parent[AirdropFormsKeys.assetType] === "jetton") {
          return validateAddress(value);
        }
        return validateAddress(value);
      }),

    [AirdropFormsKeys.nftAddress]: Yup.string()
      .test(
        "",
        commonTranslations.isRequired("NFT address"),
        (value, context) => {
          if (context.parent[AirdropFormsKeys.assetType] === "nft") {
            return !!value;
          }
          return true;
        }
      )
      .test("", "Invalid NFT address", (value, context) => {
        if (context.parent[AirdropFormsKeys.assetType] === "nft") {
          return validateAddress(value);
        }
        return validateAddress(value);
      }),
  });
};

export const useForm = (values: AirdropForm): FormArgs<AirdropForm> => {
  return useMemo(() => {
    let inputs: InputArgs<AirdropForm>[] = [
      {
        name: AirdropFormsKeys.assetType,
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
      name: AirdropFormsKeys.nftAddress,
      label: "NFT collection address",
      type: "text",
      required: true,
      EndAdornment: () => <NFTImg address={values.nftAddress} />,
      text: "Some text",
    };

    const jettonsInput: InputArgs<AirdropForm> = {
      name: AirdropFormsKeys.jettonAddress,
      label: "Jetton wallet address",
      type: "text",
      required: true,
      EndAdornment: () => <JettonImg address={values.jettonAddress} />,
      text: "Some text",
    };

    if (values.assetType === "jetton") {
      inputs = [...inputs, jettonsInput];
    } else if (values.assetType === "nft") {
      inputs = [...inputs, nftInput];
    }
    return {
      inputs,
    };
  }, [values.jettonAddress, values.nftAddress, values.assetType]);
};
