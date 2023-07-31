import { Button } from "components";
import { FormikProps, useFormik } from "formik";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import _ from "lodash";
import {
  useAirdropPersistStore,
  useVotersSelectStore,
} from "pages/airdrop/store";
import { AirdropStoreKeys, VoterSelectionMethod } from "pages/airdrop/types";
import { useEffect, useMemo } from "react";
import { FormArgs, InputArgs } from "types";
import * as Yup from "yup";
import { useAirdropVotersQuery } from "./hooks";

export interface VotersSelectForm {
  [AirdropStoreKeys.votersAmount]?: number;
  [AirdropStoreKeys.selectionMethod]?: VoterSelectionMethod;
}

export const useVotersSelectFormik = (
  onSubmit: (value: VotersSelectForm) => void,
  initialValues: {
    votersAmount?: number;
    selectionMethod?: VoterSelectionMethod;
  }
) => {
  const schema = useFormSchema();
  return useFormik<VotersSelectForm>({
    initialValues: {
      [AirdropStoreKeys.votersAmount]: initialValues.votersAmount,
      [AirdropStoreKeys.selectionMethod]: initialValues.selectionMethod,
    },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });
};

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

const MaxBtn = ({ formik }: { formik: FormikProps<VotersSelectForm> }) => {
  const { data: votes } = useAirdropVotersQuery();
  const { proposals } = useAirdropPersistStore();

  const onClick = async () => {
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
  values: VotersSelectForm
): FormArgs<VotersSelectForm> => {
  const { data: voters } = useAirdropVotersQuery();

  return useMemo(() => {
    let inputs: InputArgs<VotersSelectForm>[] = [
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
                All voters{" "}
                <small>{`(${_.size(voters).toLocaleString()})`}</small>
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
  }, [values]);
};
