import { Radio, styled, Typography } from "@mui/material";
import {
  CLIENT_V2_API_KEY,
  DEFAULT_CLIENT_V2_ENDPOINT,
  DEFAULT_CLIENT_V4_ENDPOINT,
} from "config";
import { useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import AnimateHeight from "react-animate-height";
import { Endpoints, FormArgs } from "types";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Button, FormikInputsForm, Popup } from "components";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";

const useFormSchema = () => {
  const commonTranslations = useCommonTranslations()
   const translations = useProposalPageTranslations();
  return Yup.object().shape({
    clientV2Endpoint: Yup.string().required(
      commonTranslations.isRequired(translations.httpsv2Endpoint)
    ),
    apiKey: Yup.string(),
    clientV4Endpoint: Yup.string().required(commonTranslations.isRequired(translations.httpv4Endpoint)),
  });
};

const useForm = (): FormArgs<EndpointForm>[] => {
  const translations = useProposalPageTranslations();
  return [
    {
      title: "",
      inputs: [
        {
          label: translations.httpsv2Endpoint,
          type: "text",
          name: "clientV2Endpoint",
        },
        {
          label: translations.httpsv2ApiKey,
          type: "text",
          name: "apiKey",
        },
        {
          label: translations.httpv4Endpoint,
          type: "text",
          name: "clientV4Endpoint",
        },
      ],
    },
  ];
};

interface EndpointForm {
  clientV2Endpoint: string;
  apiKey: string;
  clientV4Endpoint: string;
}

export function EndpointPopup({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: ({ clientV2Endpoint, clientV4Endpoint, apiKey }: Endpoints) => void;
}) {
  const [customSelected, setCustomSelected] = useState(false);
  const validationSchema = useFormSchema();
  const translations = useProposalPageTranslations();
  const form = useForm()
  const formik = useFormik<EndpointForm>({
    initialValues: {
      apiKey: "",
      clientV2Endpoint: "",
      clientV4Endpoint: "",
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {      
      onSubmit({
        clientV2Endpoint: values.clientV2Endpoint,
        clientV4Endpoint: values.clientV4Endpoint,
        apiKey: values.apiKey,
      });
       onClose();
    },
  });

  const _onSubmit = () => {
    if (customSelected) {
      formik.submitForm();
      return;
    }

    onSubmit({
      clientV2Endpoint: DEFAULT_CLIENT_V2_ENDPOINT,
      clientV4Endpoint: DEFAULT_CLIENT_V4_ENDPOINT,
      apiKey: CLIENT_V2_API_KEY,
    });
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    setCustomSelected(false);
    formik.resetForm({
      values: {
        apiKey: "",
        clientV2Endpoint: "",
        clientV4Endpoint: "",
      },
    });
  }, [open]);

  return (
    <StyledPopup
      open={open}
      onClose={onClose}
      title={translations.rpcSelectTitle}
    >
      <StyledFlexColumn gap={0}>
        <StyledFlexColumn gap={5}>
          <StyledRadio onClick={() => setCustomSelected(false)}>
            <Radio
              checked={!customSelected}
              onChange={() => setCustomSelected(false)}
            />
            <Typography>{translations.tonAccessEnpoint}</Typography>
          </StyledRadio>
          <StyledRadio onClick={() => setCustomSelected(true)}>
            <Radio
              checked={customSelected}
              onChange={() => setCustomSelected(true)}
            />
            <Typography>{translations.customEndpoint}</Typography>
          </StyledRadio>
        </StyledFlexColumn>

        <AnimateHeight
          style={{ width: "100%" }}
          height={customSelected ? "auto" : 0}
          duration={200}
        >
          <FormikInputsForm<EndpointForm> form={form} formik={formik} />
        </AnimateHeight>
        <StyledSaveButton onClick={_onSubmit}>
          {translations.verify}
        </StyledSaveButton>
      </StyledFlexColumn>
    </StyledPopup>
  );
}

const StyledRadio = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  cursor: "pointer",
  p: {
    fontWeight: 500,
    fontSize: 17,
  },
});

const StyledPopup = styled(Popup)({
  maxWidth: 600,
  padding: 0,
  ".formik-form": {
    border: "unset!important",
   

    boxShadow: "unset",
    ".title-container-children": {
      padding: 20,
    },
  },
});


const StyledSaveButton = styled(Button)({
  width: "100%",
  maxWidth: 200,
  marginTop: 30,
  marginBottom: 10
});
