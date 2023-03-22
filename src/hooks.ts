import { useState, useLayoutEffect } from "react";
import { matchRoutes, useLocation, useParams } from "react-router-dom";
import { flatRoutes } from "consts";
import { useAppPersistedStore } from "store";
import { InputInterface } from "types";
import { urlPatternValidation } from "utils";

export const useDaoAddress = () => {
  return useParams().spaceId as string;
};

export const useProposalAddress = () => {
  return useParams().proposalId!;
  // return "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS";
};

export const useCurrentRoute = () => {
  const location = useLocation();
  const route = matchRoutes(flatRoutes, location);

  return route ? route[0].route.path : undefined;
};

export const useWindowResize = () => {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};

export const useIsCustomEndpoint = () => {
  const { clientV2Endpoint, clientV4Endpoint } = useAppPersistedStore();

  return !!clientV2Endpoint && !!clientV4Endpoint;
};

export const useInputValidation = (inputs: InputInterface[]) => {
  const [errors, setErrors] = useState({} as { [key: string]: string });

  const clearError = (name: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = <T>(values: T) => {
    let _errors: { [key: string]: string } = {};
    inputs.forEach((input) => {
      let error = "";
      const value = values[input.name as keyof T];
      if (!value && input.required) {
        error = "Required field";
      }
      else{
        switch (input.type) {
          case "url":
            error =
              value && !urlPatternValidation(value as string)
                ? "Invalid URL"
                : "";
          default:
            break;
        }
      }
      _errors[input.name] = error;
    });

    setErrors(_errors);
    return _errors;
  };

  return { validate, errors, clearError };
};
