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
import { InputInterface } from "types";
import analytics from "analytics";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Button, MapInput, Popup } from "components";
import { GoSettings } from "react-icons/go";
import { useIsCustomEndpoint } from "./hooks";
import { useEnpointsStore } from "store";

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

function EndpointPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const store = useEnpointsStore();
  const isCustomEndpoint = useIsCustomEndpoint();

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
      store.setEndpoints({
        clientV2Endpoint: values.clientV2Endpoint,
        clientV4Endpoint: values.clientV4Endpoint,
        apiKey: values.apiKey,
      });
    },
  });
  const [customSelected, setCustomSelected] = useState(false);

  useEffect(() => {
    setCustomSelected(!!isCustomEndpoint);
  }, [isCustomEndpoint, open]);

  const onSubmit = async () => {
    if (!customSelected) {
      analytics.GA.selectDefaultEndpointsClick();
      store.setEndpoints(undefined);
    } else {
      formik.handleSubmit();
    }
    onClose();
  };

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
        <StyledSaveButton onClick={onSubmit}>Save</StyledSaveButton>
      </StyledFlexColumn>
    </StyledPopup>
  );
}


export const CustomEndpointButton = () => {
  const [open, setOpen] = useState(false);

  const showPopup = () => {
    analytics.GA.endpointSettingsClick();
    setOpen(true);
  };

  return (
    <>
      <StyledSettingsButton onClick={showPopup}>
        <GoSettings />
      </StyledSettingsButton>
      <EndpointPopup open={open} onClose={() => setOpen(false)} />
    </>
  );
};

const StyledSettingsButton = styled(Button)({
  borderRadius:'50%',
  width: 40,
  height: 40,
  padding: 0
})

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
});

const StyledSaveButton = styled(Button)({
  width: "100%",
  maxWidth: 200,
 
});
