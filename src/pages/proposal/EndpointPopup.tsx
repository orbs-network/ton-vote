import { Fade, Radio, styled, Typography } from "@mui/material";
import {
  CLIENT_V2_API_KEY,
  DEFAULT_CLIENT_V2_ENDPOINT,
  DEFAULT_CLIENT_V4_ENDPOINT,
} from "config";
import _ from "lodash";
import { useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import AnimateHeight from "react-animate-height";
import { Endpoints, InputInterface } from "types";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Button, MapInput, Popup } from "components";
import { useEnpointsStore } from "./store";

const FormSchema = Yup.object().shape({
  clientV2Endpoint: Yup.string().required("Required"),
  apiKey: Yup.string(),
  clientV4Endpoint: Yup.string().required("Required"),
});

const inputs: InputInterface[] = [
  {
    label: "HTTP v2 endpoint",
    type: "text",
    name: "clientV2Endpoint",
  },
  {
    label: "HTTP v2 API key",
    type: "text",
    name: "apiKey",
  },
  {
    label: "HTTP v4 endpoint",
    type: "text",
    name: "clientV4Endpoint",
  },
];

interface FormData {
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
  const { endpoints } = useEnpointsStore();
  const [customSelected, setCustomSelected] = useState(false);

  const formik = useFormik<FormData>({
    initialValues: {
      apiKey: endpoints?.apiKey || CLIENT_V2_API_KEY,
      clientV2Endpoint:
        endpoints?.clientV2Endpoint || DEFAULT_CLIENT_V2_ENDPOINT,
      clientV4Endpoint:
        endpoints?.clientV4Endpoint || DEFAULT_CLIENT_V4_ENDPOINT,
    },
    validationSchema: FormSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      onSubmit({
        clientV2Endpoint: values.clientV2Endpoint,
        clientV4Endpoint: values.clientV4Endpoint,
        apiKey: values.apiKey,
      });
    },
  });

  const _onSubmit = () => {
    if (customSelected) {
      formik.submitForm();
    } else {
      onSubmit({});
    }
    onClose();
  };
  useEffect(() => {
    setCustomSelected(
      !!endpoints?.clientV2Endpoint && !!endpoints.clientV4Endpoint
    );
  }, [endpoints?.clientV2Endpoint, endpoints?.clientV4Endpoint, open]);

  return (
    <StyledPopup open={open} onClose={onClose} title="RPC endpoint settings">
      <StyledFlexColumn>
        <StyledFlexColumn gap={5} style={{ marginBottom: 20 }}>
          <StyledRadio>
            <Radio
              checked={!customSelected}
              onChange={() => setCustomSelected(false)}
            />
            <Typography>Default endpoint {`(Orbs Ton Access)`}</Typography>
          </StyledRadio>
          <StyledRadio>
            <Radio
              checked={customSelected}
              onChange={() => setCustomSelected(true)}
            />
            <Typography>Custom endpoint</Typography>
          </StyledRadio>
        </StyledFlexColumn>

        <AnimateHeight
          style={{ width: "100%" }}
          height={customSelected ? "auto" : 0}
          duration={200}
        >
          <Fade in={customSelected}>
            <StyledCustomEndpoints gap={20}>
              {inputs.map((input) => {
                return (
                  <MapInput<FormData>
                    key={input.name}
                    input={input}
                    formik={formik}
                  />
                );
              })}
            </StyledCustomEndpoints>
          </Fade>
        </AnimateHeight>
        <StyledSaveButton onClick={_onSubmit}>Verify</StyledSaveButton>
      </StyledFlexColumn>
    </StyledPopup>
  );
}

const StyledCustomEndpoints = styled(StyledFlexColumn)({
  paddingBottom: 30,
});

const StyledRadio = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  p: {
    fontWeight: 500,
    fontSize: 17,
  },
});

const StyledPopup = styled(Popup)({
  maxWidth: 600,
  padding: 0,
});

const StyledSaveButton = styled(Button)({
  width: "100%",
  maxWidth: 200,
});
