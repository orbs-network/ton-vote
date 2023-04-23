import {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { matchRoutes, useLocation, useParams } from "react-router-dom";
import { flatRoutes } from "consts";
import {
  Address,
  beginCell,
  Sender,
  SenderArguments,
  storeStateInit,
} from "ton-core";
import { useConnection } from "ConnectionProvider";
import { TON_CONNECTOR } from "config";
import { useDaoQuery } from "query/queries";
import { showSuccessToast } from "toasts";
import { ProposalStatus } from "types";
import { useTranslation } from "react-i18next";
import { StringParam, useQueryParams } from "use-query-params";

export const useDaoAddress = () => {
  return useParams().daoId as string;
};

export const useProposalAddress = () => {
  return useParams().proposalId!;
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

export const useIsOwner = (daoAddress: string) => {
  const address = useConnection().address;
  const { data, isLoading } = useDaoQuery(daoAddress);

  return {
    isDaoOwner: address && address === (data as any)?.daoRoles.owner,
    isProposalOnwer:
      address && address === (data as any)?.daoRoles.proposalOwner,
    isLoading,
  };
};

export const useGetSender = () => {
  const { address } = useConnection();

  return useCallback((): Sender => {
    if (!address) {
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
        await TON_CONNECTOR.sendTransaction({
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
  }, [address]);
};

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>; // Return success

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast("Copied to clipboard");
      return true;
    } catch (error) {
      console.warn("Copy failed", error);

      return false;
    }
  };

  return [null, copy];
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useDebouncedCallback = (func: any, wait: number = 300) => {
  // Use a ref to store the timeout between renders
  // and prevent changes to it from causing re-renders
  const timeout = useRef<any>();

  return useCallback(
    (...args: any) => {
      const later = () => {
        clearTimeout(timeout.current);
        func(...args);
      };

      clearTimeout(timeout.current);
      timeout.current = setTimeout(later, wait);
    },
    [func, wait]
  );
};

export const useProposalStatusText = (status?: ProposalStatus | null) => {
  const { t } = useTranslation();
  switch (status) {
    case ProposalStatus.CLOSED:
      return t("ended");
    case ProposalStatus.ACTIVE:
      return t("active");
    case ProposalStatus.NOT_STARTED:
      return t("notStarted");
    default:
      break;
  }
};

