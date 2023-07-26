import { Button } from "components";
import { FormikProps } from "formik";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { useGetAirdropVotes } from "pages/airdrop/hooks";
import {  AirdropForm, useAirdropStore } from "pages/airdrop/store";
import { AirdropStoreKeys, VoterSelectionMethod } from "pages/airdrop/types";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import * as Yup from "yup";


export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  return Yup.object().shape({
    [AirdropStoreKeys.selectionMethod]: Yup.string().required(
      commonTranslations.isRequired("Voters selection method")
    ),
    [AirdropStoreKeys.votersAmount]: Yup.number().test(
      "",
      commonTranslations.isRequired("Random voters amount"),
      (value, context) => {
        if (
          context.parent[AirdropStoreKeys.selectionMethod] ==
          VoterSelectionMethod.RANDOM
        ) {
          return !!value;
        }
        return true;
      }
    ),
    [AirdropStoreKeys.manuallySelectedVoters]: Yup.array().test(
      "",
      commonTranslations.isRequired("Selecte at least one voter"),
      (value, context) => {
        if (
          context.parent[AirdropStoreKeys.selectionMethod] ==
          VoterSelectionMethod.MANUALLY
        ) {
          return !_.isEmpty(value);
        }
        return true;
      }
    ),
  });
};

const MaxBtn = ({ formik }: { formik: FormikProps<AirdropForm> }) => {
  const getVotes = useGetAirdropVotes();
  const {} = useAirdropStore();

  const onClick = async () => {
    const votes = await getVotes();
    formik.setFieldValue(AirdropStoreKeys.votersAmount, _.size(votes));
    formik.setFieldError(AirdropStoreKeys.votersAmount, undefined);
  };

  return (
    <Button variant="text" onClick={onClick}>
      Max
    </Button>
  );
};

export const useForm = (
  values: AirdropForm
): FormArgs<AirdropForm> => {
  return useMemo(() => {
    let inputs: InputArgs<AirdropForm>[] = [
      {
        name: AirdropStoreKeys.selectionMethod,
        label: "Voters selection method",
        type: "radio",
        required: true,
        selectOptions: [
          { value: VoterSelectionMethod.RANDOM, text: "Random" },
          { value: VoterSelectionMethod.MANUALLY, text: "Manual" },
          { value: VoterSelectionMethod.ALL, text: "All voters" },
        ],
      },
    ];

    if (values.selectionMethod === VoterSelectionMethod.RANDOM) {
      inputs = [
        ...inputs,
        {
          name: AirdropStoreKeys.votersAmount,
          label: "Random voters amount",
          type: "number",
          required: true,
          EndAdornment: MaxBtn,
        },
      ];
    }
    if (values.selectionMethod === VoterSelectionMethod.MANUALLY) {
      inputs = [
        ...inputs,
        {
          name: "",
          label: "",
          type: "custom",
          required: true,
        },
      ];
    }

    return {
      inputs,
    };
  }, [values.selectionMethod]);
};
