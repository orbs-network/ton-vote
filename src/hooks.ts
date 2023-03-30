import { useState, useLayoutEffect, useCallback } from "react";
import { matchRoutes, useLocation, useParams } from "react-router-dom";
import { flatRoutes } from "consts";
import { useAppPersistedStore } from "store";
import { useConnectionStore } from "connection";
import {
  Address,
  beginCell,
  Sender,
  SenderArguments,
  storeStateInit,
} from "ton-core";
import { useDaoRolesQuery } from "query/queries";

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

export const useIsOwner = (daoAddress: string) => {
  const address = useConnectionStore().address;
  const { data } = useDaoRolesQuery(daoAddress);

  return {
    isDaoOwner: address && address === data?.owner.toString(),
    isProposalOnwer: address && address === data?.proposalOwner.toString(),
  };
};

export const useGetSender = () => {
  const { connectorTC, address } = useConnectionStore();

  return useCallback((): Sender => {
    if (!connectorTC || !address) {
      throw new Error("Not connected");
    }

    const init = (init: any) => {
      const result = init
        ? beginCell()
            .store(storeStateInit(init))
            .endCell()
            .toBoc({ idx: false })
            .toString("base64")
        : undefined;

      return result;
    };

    return {
      address: Address.parse(address!),
      async send(args: SenderArguments) {
        await connectorTC.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              stateInit: init(args.init),
              payload: args.body
                ? args.body.toBoc().toString("base64")
                : undefined,
            },
          ],
        });
      },
    };
  }, [connectorTC, address]);
};
