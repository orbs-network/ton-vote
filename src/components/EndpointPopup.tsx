import { Box, Fade, Radio, styled, Typography } from "@mui/material";
import {
  CLIENT_V2_API_KEY,
  DEFAULT_CLIENT_V2_ENDPOINT,
  DEFAULT_CLIENT_V4_ENDPOINT,
} from "config";
import _ from "lodash";
import { useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Button } from "./Button";
import { Popup } from "./Popup";
import AnimateHeight from "react-animate-height";
import { useAppPersistedStore, useEnpointModal } from "store";
import { useMutation } from "@tanstack/react-query";
import { EndpointsArgs, InputInterface } from "types";
import analytics from "analytics";
import { useIsCustomEndpoint } from "hooks";
import { MapInput } from "./Inputs";
import * as Yup from "yup";
import { useFormik } from "formik";

export const FormSchema = Yup.object().shape({
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

export function EndpointPopup() {
  const store = useAppPersistedStore();
  const isCustomEndpoint = useIsCustomEndpoint();
  const setEndpoints = useAppPersistedStore((store) => store.setEndpoints);

  const formik = useFormik<FormData>({
    initialValues: {
      apiKey: store.apiKey || CLIENT_V2_API_KEY,
      clientV2Endpoint: store.clientV2Endpoint || DEFAULT_CLIENT_V2_ENDPOINT,
      clientV4Endpoint: store.clientV4Endpoint || DEFAULT_CLIENT_V4_ENDPOINT,
    },
    validationSchema: FormSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      analytics.GA.selectCustomEndpointClick(
        values.clientV2Endpoint,
        values.clientV4Endpoint
      );
      setEndpoints({
        clientV2Endpoint: values.clientV2Endpoint,
        clientV4Endpoint: values.clientV4Endpoint,
        apiKey: values.apiKey,
      });
    },
  });
  const [customSelected, setCustomSelected] = useState(false);

  const endpointModal = useEnpointModal();

  useEffect(() => {
    setCustomSelected(!!isCustomEndpoint);
  }, [isCustomEndpoint, endpointModal.error]);

  const onSubmit = async () => {    
    if (!customSelected) {
      analytics.GA.selectDefaultEndpointsClick();
      setEndpoints(undefined);
    } else {
      formik.handleSubmit();
    }
    onClose();
  };

  const onClose = () => {
    endpointModal.setError(false);
    endpointModal.setShow(false);
  };

  return (
    <Popup
      open={endpointModal.show}
      close={onClose}
      title="RPC endpoint settings"
    >
      <StyledContent>
        {endpointModal.error && (
          <StyledError>
            <Typography>Endpoint Error: Insert different endpoints</Typography>
          </StyledError>
        )}
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
        <StyledSaveButton onClick={onSubmit}>Save</StyledSaveButton>
      </StyledContent>
    </Popup>
  );
}

export const useUpdateEndpoints = () => {
  const setEndpoints = useAppPersistedStore((store) => store.setEndpoints);

  return useMutation(async (args?: EndpointsArgs) => setEndpoints(args));
};

const StyledError = styled(Box)({
  p: {
    color: "red",
    fontSize: 14,
    fontWeight: 500,
  },
});

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

const StyledContent = styled(StyledFlexColumn)({
  width: "calc(100vw - 80px)",
  maxWidth: 500,
});

const StyledTitle = styled(Typography)({
  marginBottom: 10,
});

const StyledSaveButton = styled(Button)({
  width: "100%",
  maxWidth: 200,
});
