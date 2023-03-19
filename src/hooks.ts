import { useState, useLayoutEffect } from "react";
import { matchRoutes, useLocation, useParams } from "react-router-dom";
import { flatRoutes } from "consts";
import { CONTRACT_ADDRESS } from "config";

export const useDaoId = () => {
  return useParams().spaceId as string;
};

export const useProposalId = () => {
  // return useParams().proposalId;
  return CONTRACT_ADDRESS
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
