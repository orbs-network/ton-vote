import {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { matchRoutes, useLocation, useParams } from "react-router-dom";
import { flatRoutes, MOBILE_WIDTH } from "consts";
import {
  Address,
  beginCell,
  Sender,
  SenderArguments,
  storeStateInit,
} from "ton-core";
import { releaseMode } from "config";
import { showSuccessToast } from "toasts";
import { ProposalStatus } from "types";
import { StringParam, useQueryParams } from "use-query-params";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useMediaQuery } from "@mui/material";
import { DaoRoles, ReleaseMode } from "ton-vote-contracts-sdk";
import { useDaoQuery } from "query/getters";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

export const useDaoAddressFromQueryParam = () => {
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

export const useGetSender = () => {
  const address = useTonAddress();
  const [tonConnect] = useTonConnectUI();
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
        await tonConnect.sendTransaction({
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
  const t = useCommonTranslations();
  switch (status) {
    case ProposalStatus.CLOSED:
      return t.ended;
    case ProposalStatus.ACTIVE:
      return t.active;
    case ProposalStatus.NOT_STARTED:
      return t.notStarted;
    default:
      break;
  }
};

enum Params {
  PROPOSAL_STATE = "proposal-state",
  SEARCH = "search",
  DEV = "dev",
}

export const useAppQueryParams = () => {
  const [query, setQuery] = useQueryParams({
    [Params.PROPOSAL_STATE]: StringParam,
    [Params.SEARCH]: StringParam,
    [Params.DEV]: StringParam,
  });

  return {
    query: {
      proposalState: query[Params.PROPOSAL_STATE] as string | undefined,
      search: query.search as string | undefined,
      dev: query.dev as string | undefined,
    },
    setProposalState: (state: string | undefined) => {
      setQuery({ [Params.PROPOSAL_STATE]: state }, "pushIn");
    },
    setDev: (state: string | undefined) => {
      setQuery({ [Params.DEV]: state }, "pushIn");
    },
    setSearch: (search: string | undefined) => {
      setQuery({ [Params.SEARCH]: search || undefined }, "pushIn");
    },
  };
};

export const useMobile = () => {
  const macthes = useMediaQuery(`(max-width: ${MOBILE_WIDTH}px)`);
  return macthes;
};

export const useParseError = () => {
  const translations = useCommonTranslations();
  return (error?: string) => {
    if (!error) return translations.somethingWentWrong;
    if (error.includes("UserRejectsError")) {
      return translations.transactionRejected;
    }
    return error;
  };
};

export const useDevFeatures = () => {
  const dev = useAppQueryParams().query.dev;

  return dev || releaseMode === ReleaseMode.DEVELOPMENT;
};

export const useRole = (roles?: DaoRoles) => {
  const address = useTonAddress();

  const getRole = (_roles?: DaoRoles) => {
    return {
      isOwner: !roles ? false : address === roles.owner,
      isProposalPublisher: !roles ? false : address === roles.proposalOwner,
    };
  };

  return {
    ...getRole(roles),
    getRole,
  };
};
