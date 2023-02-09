import { Box, Fade, Radio, styled, Typography } from "@mui/material";
import { ENDPOINT_INPUTS, INVALID_ENDPOINT_ERROR } from "config";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Button } from "./Button";
import { Input } from "./Input";
import { Popup } from "./Popup";
import AnimateHeight from "react-animate-height";
import { useContractStore, useEndpointStore, useFetchClients, usePersistedStore, useServerStore } from "store";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useStateQuery } from "queries";
import { EndpointsArgs, QueryKeys } from "types";


const { clientV2, apiKey, clientV4 } = ENDPOINT_INPUTS;

export function EndpointPopup() {
  const store = usePersistedStore();
  const { validate, errors, clearError } = useValidation();
  const [customEndopointsSelected, setCustomEndopointsSelected] =
    useState(false);
  const [values, setValues] = useState({
    [clientV2.name]: store.clientV2Endpoint || clientV2.defaut,
    [apiKey.name]: store.apiKey || apiKey.default,
    [clientV4.name]: store.clientV4Endpoint || clientV4.defaut,
  });

  const {showSetEndpoint, endpointError, setShowSetEndpoint , setEndpointError} = useEndpointStore()

  const { mutateAsync, isLoading } = useUpdateEndpoints()


  const select = (value: boolean) => {
    setCustomEndopointsSelected(value);
  };

  useEffect(() => {
    setCustomEndopointsSelected(store.isCustomEndpoints);
  }, [store.isCustomEndpoints, showSetEndpoint]);

  const onUpdate = (name: string, value: string) => {
    setValues((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const onSave = async () => {
    if (!customEndopointsSelected) {
      await mutateAsync(undefined);
      onClose();
      return;
    }

    if (!validate(values)) {
      return;
    }
    await mutateAsync({
      clientV2Endpoint: values[clientV2.name],
      clientV4Endpoint: values[clientV4.name],
      apiKey: values[apiKey.name],
    });
    onClose();
  };

  const onClose = () => {
    setEndpointError(false);
    setShowSetEndpoint(false);
  };

  return (
    <Popup open={showSetEndpoint} close={onClose}>
      <StyledContent>
        <StyledTitle variant="h4">RPC endpoint settings</StyledTitle>
        {endpointError && (
          <StyledError>
            <Typography>Endpoint Error: Insert different endpoints</Typography>
          </StyledError>
        )}
        <StyledFlexColumn gap={5} style={{ marginBottom: 20 }}>
          <StyledRadio>
            <Radio
              checked={!customEndopointsSelected}
              onChange={() => select(false)}
            />
            <Typography>Default endpoint {`(Orbs Ton Access)`}</Typography>
          </StyledRadio>
          <StyledRadio>
            <Radio
              checked={customEndopointsSelected}
              onChange={() => select(true)}
            />
            <Typography>Custom endpoint</Typography>
          </StyledRadio>
        </StyledFlexColumn>

        <AnimateHeight
          style={{ width: "100%" }}
          height={customEndopointsSelected ? "auto" : 0}
          duration={200}
        >
          <Fade in={customEndopointsSelected}>
            <StyledCustomEndpoints gap={20}>
              {_.map(ENDPOINT_INPUTS).map((input) => {
                return (
                  <Input
                    onFocus={() => clearError(input.name)}
                    key={input.name}
                    error={
                      errors[input.name] ? INVALID_ENDPOINT_ERROR : undefined
                    }
                    label={input.label}
                    value={values[input.name]}
                    onChange={(value) => onUpdate(input.name, value)}
                  />
                );
              })}
            </StyledCustomEndpoints>
          </Fade>
        </AnimateHeight>
        <StyledSaveButton isLoading={isLoading} onClick={onSave}>
          Save
        </StyledSaveButton>
      </StyledContent>
    </Popup>
  );
}


export const useUpdateEndpoints = () => {
  const queryClient = useQueryClient();
  const { onUpdate: onEndpointsUpdate } = usePersistedStore();
  const { mutateAsync: getClients } = useFetchClients();
  const resetContractStore = useContractStore().reset;
  const resetServerStore = useServerStore().reset;
  const { refetch } = useStateQuery();

  return useMutation(async (args?: EndpointsArgs) => {
    resetContractStore();
    resetServerStore();
    onEndpointsUpdate(
      args?.clientV2Endpoint,
      args?.clientV4Endpoint,
      args?.apiKey
    );
    await getClients({
      clientV2Endpoint: args?.clientV2Endpoint,
      clientV4Endpoint: args?.clientV4Endpoint,
      apiKey: args?.apiKey,
    });

    queryClient.removeQueries({ queryKey: [QueryKeys.PROPOSAL_INFO] });
    queryClient.removeQueries({ queryKey: [QueryKeys.STATE] });
    await refetch();
  });
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

interface ValidateArgs {
  [key: string]: string;
}

const useValidation = () => {
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const validate = (inputs: ValidateArgs) => {
    let _errors: { [key: string]: boolean } = {};
    let clean = true;
    _.map(inputs, (value, key) => {
      if (key === ENDPOINT_INPUTS.apiKey.name) {
        return;
      }
      if (!value.startsWith("https://")) {
        clean = false;
        _errors[key] = true;
      }
    });
    setErrors(_errors);
    return clean;
  };

  const clearError = (name: string) => {
    setErrors((prevState) => {
      return {
        ...prevState,
        [name]: false,
      };
    });
  };

  return {
    errors,
    validate,
    clearError,
  };
};

const StyledContent = styled(StyledFlexColumn)({
  width: "calc(100vw - 80px)",
  maxWidth: 500,
});

const StyledTitle = styled(Typography)({
  marginBottom: 10,
});

const StyledSaveButton = styled(Button)({
  width: "100%",
});
