import { Button } from "components";
import { FormikProps } from "formik";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import { useAirdropVotersQuery, useGetAirdropVotes } from "pages/airdrop/hooks";
import {  AirdropForm, useAirdropStore } from "pages/airdrop/store";
import { AirdropStoreKeys, VoterSelectionMethod } from "pages/airdrop/types";
import { useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import * as Yup from "yup";


export const useFormSchema = () => {
  const commonTranslations = useCommonTranslations();
  const airdropTranslations = useAirdropTranslations();
  return Yup.object().shape({
    [AirdropStoreKeys.selectionMethod]: Yup.string().required(
      commonTranslations.isRequired("Voters selection method")
    ),
    [AirdropStoreKeys.votersAmount]: Yup.number().test(
      "",
      commonTranslations.isRequired(airdropTranslations.randomVotersAmount),
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
  });
};

const MaxBtn = ({ formik }: { formik: FormikProps<AirdropForm> }) => {
  const getVotes = useGetAirdropVotes();
  const {proposals} = useAirdropStore();

  const onClick = async () => {
    const votes = await getVotes();
    formik.setFieldValue(AirdropStoreKeys.votersAmount, _.size(votes));
    formik.setFieldError(AirdropStoreKeys.votersAmount, undefined);
  };

  if (_.isEmpty(proposals)) return null;
    return (
      <Button variant="text" onClick={onClick}>
        Max
      </Button>
    );
};

export const useForm = (
  values: AirdropForm
): FormArgs<AirdropForm> => {
  const {data: voters} = useAirdropVotersQuery()
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
          {
            value: VoterSelectionMethod.ALL,
            text: (
              <>
                All voters <small>{`(${_.size(voters).toLocaleString()})`}</small>
              </>
            ),
          },
        ],
      },
    ];

    if (values.selectionMethod === VoterSelectionMethod.RANDOM) {
      inputs = [
        ...inputs,
        {
          name: AirdropStoreKeys.votersAmount,
          label: "Number of random voters",
          type: "number",
          required: true,
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
  }, [values.selectionMethod, _.size(voters)]);
};
