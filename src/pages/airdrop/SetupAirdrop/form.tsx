import { styled } from "@mui/material";
import { Img } from "components";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { useAssetMetadataQuery } from "query/getters";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { AirdropForm } from "../types";

const names = {
  walletsAmount: "walletsAmount",
  assetAmount: "assetAmount",
  address: "address",
  type: "type",
  votersSelectionMethod: "votersSelectionMethod",
  manualVoters: "manualVoters",
};

export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object().shape({
    [names.type]: Yup.string().required(
      commonTranslations.isRequired("Asset type")
    ),

    [names.votersSelectionMethod]: Yup.number().required(
      commonTranslations.isRequired("Voters selection method")
    ),

    [names.walletsAmount]: Yup.string().test(
      "",
      commonTranslations.isRequired("Random voters amount"),
      (value, context) => {
        if (context.parent.votersSelectionMethod === 1) {
          return !!value;
        }
        return true;
      }
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

    [names.manualVoters]: Yup.array().test(
      "",
      "Select at least one voter manually",
      (value, context) => {
        if (context.parent.manualSelect === 2) {
          return _.size(value) > 0;
        }
        return true;
      }
    ),

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

function AirdropAssetImg({ address }: { address?: string }) {
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
        name: names.votersSelectionMethod,
        label: "Voters selection method",
        type: "select",
        required: true,
        selectOptions: [
          {
            text: "Random selection",
            value: 1,
          },
          {
            text: "Manual selection",
            value: 2,
          },
        ],
      },
    ];

    const votersRandomSelect: InputArgs<AirdropForm> = {
      name: names.walletsAmount,
      label: "Voters amount",
      type: "number",
      required: true,
    };

    const votersManualSelect: InputArgs<AirdropForm> = {
      name: names.manualVoters,
      label: "Select voters",
      type: "custom",
      required: true,
    };
    if (values.votersSelectionMethod === 1) {
      inputs.push(votersRandomSelect);
    } else if (values.votersSelectionMethod === 2) {
      inputs.push(votersManualSelect);
    }

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
  }, [values.address, values.type, values.votersSelectionMethod]);
};
