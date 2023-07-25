import { styled, Typography } from "@mui/material";
import { AppTooltip, Button } from "components";
import { FormikProps } from "formik";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { AirdropAssetImg } from "../../AirdropAssetImg";
import { useGetAirdropVotes } from "../../hooks";
import { AirdropForm } from "../../types";

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
        if (context.parent.votersSelectionMethod === 2) {
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

const SelectAllVotersBtn = ({
  formik,
}: {
  formik: FormikProps<AirdropForm>;
}) => {
  const getVotes = useGetAirdropVotes();
  const onClick = async () => {
    const votes = await getVotes();
    formik.setFieldValue(names.walletsAmount, _.size(votes));
  };

  return (
    <AppTooltip text="Some text">
      <StyledAllButton onClick={onClick}>Max</StyledAllButton>
    </AppTooltip>
  );
};

const StyledAllButton = styled('div')({
  height: 30,
  border:'unset',
  "*": {
    fontSize: 14,
  },
});

export const useForm = (values: AirdropForm): FormArgs<AirdropForm> => {
  return useMemo(() => {
    let inputs: InputArgs<AirdropForm>[] = [
      {
        name: names.type,
        label: "Airdrop asset type",
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
        label: "Select method",
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
      EndAdornment: SelectAllVotersBtn,
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
        label: "Jetton wallet address",
        type: "text",
        required: true,
        EndAdornment: () => <AirdropAssetImg address={values.address} />,
        text:'Some text'
      },
      {
        name: names.assetAmount,
        label: "Total amount of jettons",
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
  }, [
    values.address,
    values.type,
    values.votersSelectionMethod,
    values.manualVoters,
  ]);
};
