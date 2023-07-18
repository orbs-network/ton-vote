import { styled } from "@mui/material";
import { Img } from "components";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useAssetMetadataQuery } from "query/getters";
import { useMemo } from "react";
import { FormArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const names = {
  walletsAmount: "walletsAmount",
  assetAmount: "assetAmount",
  address: "address",
  type: 'type'
};

export interface AirdropForm {
  walletsAmount?: number;
  assetAmount?: number;
  address?: string;
  type?: 'nft' | 'jetton';
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
    return {
      title: "",

      inputs: [
        {
          name: names.type,
          label: "Wallets amount",
          type: "number",
          required: true,
        },
        {
          name: names.walletsAmount,
          label: "Wallets amount",
          type: "number",
          required: true,
        },
        {
          name: names.assetAmount,
          label: "Amount of Jetton/NFT",
          type: "number",
          required: true,
        },
        {
          name: names.address,
          label: "Jetton/NFT address",
          type: "text",
          required: true,
          EndAdornment: () => <AirdropAssetImg address={values.address} />,
        },
      ],
    };
  }, [values.address]);
};

export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object().shape({
    [names.walletsAmount]: Yup.string().required(
      commonTranslations.isRequired("Wallets amount")
    ),
    [names.assetAmount]: Yup.string().required(
      commonTranslations.isRequired("Amount of Jetton/NFT")
    ),
    [names.address]: Yup.string()
      .required(commonTranslations.isRequired("address"))
      .test("", "Invalid address", validateAddress),
  });
};
