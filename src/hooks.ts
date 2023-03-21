import { useState, useLayoutEffect } from "react";
import { matchRoutes, useLocation, useParams } from "react-router-dom";
import { flatRoutes } from "consts";
import { useAppPersistedStore } from "store";

export const useDaoId = () => {
  return useParams().spaceId as string;
};

export const useProposalId = () => {
  // return useParams().proposalId;
  return "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS";
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




