import { styled } from "@mui/material";
import { Img } from "components";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useAssetMetadataQuery } from "query/getters";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const names = {
  walletsAmount: "walletsAmount",
  assetAmount: "assetAmount",
  address: "address",
  type: "type",
};

export interface AirdropForm {
  walletsAmount?: number;
  assetAmount?: number;
  address?: string;
  type?: "nft" | "jetton";
}

export function AirdropAssetImg({ address }: { address?: string }) {
  const { data } = useAssetMetadataQuery(address);
  if (!data) return null;

  return <StyledImg src={data?.metadata?.image} />;
}

const StyledImg = styled(Img)({
  width: 32,
  height: 32,
  borderRadius: "50%",
});

export const useForm = (values: AirdropForm): FormArgs<AirdropForm> => {
  return useMemo(() => {
    let inputs: InputArgs<AirdropForm>[] = [
      {
        name: names.type,
        label: "Asset type (Jetton/NFT)",
        placeholder: "Select",
        type: "select",
        required: true,
        selectOptions: [
          { value: "nft", text: "NFT" },
          { value: "jetton", text: "Jetton" },
        ],
      },
      {
        name: names.walletsAmount,
        label: "Voters amount",
        type: "number",
        required: true,
      },
    ];

    const jettonsInputs: InputArgs<AirdropForm>[] = [
      {
        name: names.address,
        label: "Jetton address",
        type: "text",
        required: true,
        EndAdornment: () => <AirdropAssetImg address={values.address} />,
      },
      {
        name: names.assetAmount,
        label: "Amount of Jetton to airdrop",
        type: "number",
        required: true,
      },
    ];

    if (values.type === "jetton") {
      inputs = [...inputs, ...jettonsInputs];
    }
    return {
      title: "",
      inputs,
    };
  }, [values.address, values.type]);
};

export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object().shape({
    [names.type]: Yup.string().required(
      commonTranslations.isRequired("Asset type")
    ),
    [names.walletsAmount]: Yup.string().required(
      commonTranslations.isRequired("Voters amount")
    ),

    [names.address]: Yup.string()
      .test(
        "",
        commonTranslations.isRequired("Jetton address"),
        (value, context) => {
          if (context.parent.type === "jetton") {
            return !!value;
          }
          return true;
        }
      )
      .test("", "Invalid address", (value, context) => {
        if (context.parent.type === "jetton") {
          return validateAddress(value);
        }
        return validateAddress(value);
      }),
    [names.assetAmount]: Yup.string().test(
      "",
      commonTranslations.isRequired("Jetton amount to airdrop"),
      (value, context) => {
        if (context.parent.type === "jetton") {
          return !!value;
        }
        return true;
      }
    ),
  });
};
