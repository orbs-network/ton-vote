import { styled, Typography } from "@mui/material";
import { AppTooltip, Button } from "components";
import { FormikProps } from "formik";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { AirdropFormsKeys } from "pages/airdrop/store";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { AirdropAssetImg } from "../../AirdropAssetImg";
import { useGetAirdropVotes } from "../../hooks";
import { AirdropForm } from "../../types";

export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object().shape({
    [AirdropFormsKeys.assetType]: Yup.string().required(
      commonTranslations.isRequired("Asset type")
    ),

    [AirdropFormsKeys.assetAddress]: Yup.string()
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
      .test("", "Invalid address", (value, context) => {
        if (context.parent[AirdropFormsKeys.assetType] === "jetton") {
          return validateAddress(value);
        }
        return validateAddress(value);
      }),

    [AirdropFormsKeys.jettonsAmount]: Yup.string().test(
      "",
      commonTranslations.isRequired("Jetton amount to airdrop"),
      (value, context) => {
        if (context.parent[AirdropFormsKeys.assetType] === "jetton") {
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
        name: AirdropFormsKeys.assetType,
        label: "Airdrop asset type",
        placeholder: "Select",
        type: "select",
        required: true,
        selectOptions: [
          { value: "nft", text: "NFT" },
          { value: "jetton", text: "Jetton" },
        ],
      },
    ];

    const nftInput: InputArgs<AirdropForm> = {
      name: AirdropFormsKeys.assetAddress,
      label: "NFT collection address",
      type: "text",
      required: true,
      EndAdornment: () => <AirdropAssetImg address={values.address} />,
      text: "Some text",
    };

    const jettonsInputs: InputArgs<AirdropForm>[] = [
      {
        name: AirdropFormsKeys.assetAddress,
        label: "Jetton wallet address",
        type: "text",
        required: true,
        EndAdornment: () => <AirdropAssetImg address={values.address} />,
        text: "Some text",
      },
      {
        name: AirdropFormsKeys.jettonsAmount,
        label: "Total amount of jettons",
        type: "number",
        required: true,
      },
    ];

    if (values.type === "jetton") {
      inputs = [...inputs, ...jettonsInputs];
    } else {
      inputs = [...inputs, nftInput];
    }
    return {
      inputs,
    };
  }, [
    values.address,
    values.type,
    values.votersSelectionMethod,
    values.manualVoters,
  ]);
};
