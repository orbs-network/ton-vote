import {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  matchRoutes,
  useLocation,
  useParams,
} from "react-router-dom";
import { flatRoutes, MOBILE_WIDTH } from "consts";
import {
  Address,
  beginCell,
  fromNano,
  Sender,
  SenderArguments,
  storeStateInit,
} from "ton-core";
import { IS_DEV, STRATEGY_ARGUMENTS } from "config";
import {
  AppQueryParams,
  Dao,
  Proposal,
  ProposalStatus,
  Result,
  ThemeType,
} from "types";
import { StringParam, useQueryParams } from "use-query-params";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useMediaQuery } from "@mui/material";
import {
  DaoRoles,
  ProposalMetadata,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { THEME, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useSettingsStore } from "store";
import _ from "lodash";
import {
  getIsOneWalletOneVote,
  getproposalResult,
  getProposalResultTonAmount,
  getProposalResultVotes,
  getProposalStatus,
  getProposalSymbol,
  getStrategyArgument,
  getTonScanContractUrl,
  getVoteStrategyType,
  isEqualAddresses,
  isNftProposal,
  nFormatter,
} from "utils";
import { useQuery } from "@tanstack/react-query";
import { useDaoQuery, useProposalQuery } from "query/getters";
import { useNumericFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import { Webapp } from "WebApp";

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
      const showSuccessToast = await import("toasts").then(
        (module) => module.showSuccessToast
      );
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

export const useAppQueryParams = () => {
  const [query, setQuery] = useQueryParams({
    [AppQueryParams.PROPOSAL_STATE]: StringParam,
    [AppQueryParams.SEARCH]: StringParam,
    [AppQueryParams.DEV]: StringParam,
    [AppQueryParams.MODE]: StringParam,
    [AppQueryParams.AIRDROP_PROPOSAL]: StringParam,
  });

  return {
    query: {
      proposalState: query[AppQueryParams.PROPOSAL_STATE] as string | undefined,
      search: query.search as string | undefined,
      dev: query.dev as string | undefined,
      mode: query.mode as string | undefined,
      airdropProposal: query.airdrop_proposal as string | undefined,
    },
    setProposalState: (state: string | undefined) => {
      setQuery({ [AppQueryParams.PROPOSAL_STATE]: state }, "pushIn");
    },
    setDev: (state: string | undefined) => {
      setQuery({ [AppQueryParams.DEV]: state }, "pushIn");
    },
    setSearch: (search: string | undefined) => {
      setQuery({ [AppQueryParams.SEARCH]: search || undefined }, "pushIn");
    },
    setAirdropProposal: (value: string | undefined) => {
      setQuery(
        { [AppQueryParams.AIRDROP_PROPOSAL]: value || undefined },
        "pushIn"
      );
    },
  };
};

export const useMobile = () => {
  const macthes = useMediaQuery(`(max-width: ${MOBILE_WIDTH}px)`);
  return macthes;
};

export const useDevFeaturesMode = () => {
  const beta = useAppSettings().beta;
  return IS_DEV || beta;
};

export const useRole = (roles?: DaoRoles) => {
  const address = useTonAddress();

  const getRole = (_roles?: DaoRoles) => {
    return {
      isOwner: !_roles ? false : isEqualAddresses(address, _roles.owner),
      isProposalPublisher: !_roles
        ? false
        : isEqualAddresses(address, _roles.proposalOwner),
    };
  };

  return {
    ...getRole(roles),
    getRole,
  };
};

export const useAppSettings = () => {
  const store = useSettingsStore();
  const [_, setOptions] = useTonConnectUI();

  const toggleTheme = () => {
    setThemeMode(store.themeMode === "dark" ? "light" : "dark");
  };

  const setThemeMode = (mode: ThemeType) => {
    store.setThemeMode(mode);
    setOptions({
      uiPreferences: {
        theme: mode === "dark" ? THEME.DARK : THEME.LIGHT,
      },
    });
  };

  return {
    isDarkMode: store.themeMode === "dark",
    toggleTheme,
    setThemeMode,
    themeMode: store.themeMode,
    beta: store.beta,
    setBeta: store.setBeta,
  };
};

export const useProposalResults = (proposalAddress: string): Result[] => {
  const { data: proposal, dataUpdatedAt } = useProposalQuery(proposalAddress);
  const symbol = useGetProposalSymbol(proposalAddress);

  return useMemo(() => {
    if (!proposal) return [];

    const choices = proposal?.metadata?.votingSystem.choices;
    const type = getVoteStrategyType(proposal.metadata?.votingPowerStrategies);
    const isOneWalletOneVote = getIsOneWalletOneVote(
      proposal.metadata?.votingPowerStrategies
    );

    return _.map(choices, (choice, key) => {
      const result = getproposalResult(proposal, choice);
      const percent = result || 0;

      const amount = getProposalResultTonAmount(
        proposal,
        choice,
        percent,
        proposal.proposalResult["totalWeight"] ||
          proposal.proposalResult["totalWeights"],
        type
      );

      return {
        votesAmount: getProposalResultVotes(proposal, choice),
        choice,
        percent,
        assetAmount: isOneWalletOneVote ? undefined : `${amount} ${symbol}`,
      };
    });
  }, [dataUpdatedAt]);
};

export const useGetValidatorsProposalResult = (
  proposalAddress: string
): Result[] => {
  const { data: proposal, dataUpdatedAt } = useProposalQuery(proposalAddress);

  return useMemo(() => {
    if (!proposal) return [];

    return _.map(
      proposal.validatorsVotingData?.roundsDetails,
      (details, index) => {
        const finished = BigNumber(details.totalWeight).minus(
          BigNumber(details.weightRemaining)
        );
        const percent = Math.floor(
          BigNumber(finished)
            .div(details.totalWeight)
            .multipliedBy(100)
            .toNumber()
        );

        const assetAmount = nFormatter(fromNano(finished.toString()));

        return {
          votesAmount: _.size(details.votersList),
          choice: `Round ${index + 1}`,
          percent,
          assetAmount,
        };
      }
    );
  }, [dataUpdatedAt]);
};

export const useProposalStatus = (proposalAddress: string) => {
  const { data } = useProposalQuery(proposalAddress);
  const t = useCommonTranslations();

  const getStatus = useGetProposalStatusCallback();
  const query = useQuery(
    ["useProposalStatus", proposalAddress],
    () => getStatus(data?.metadata!),
    {
      refetchInterval: 1_000,
      enabled: !!data && !!proposalAddress,
      initialData: {
        proposalStatus: ProposalStatus.NOT_STARTED,
        proposalStatusText: t.notStarted,
      },
    }
  );

  return query.data;
};

export const useGetProposalStatusCallback = () => {
  const t = useCommonTranslations();
  return (metadata: ProposalMetadata) => {
    const status = getProposalStatus(metadata!);
    let text;

    if (status === ProposalStatus.ACTIVE) {
      text = t.active;
    }
    if (status === ProposalStatus.CLOSED) {
      text = t.ended;
    }
    if (status === ProposalStatus.NOT_STARTED) {
      text = t.notStarted;
    }

    return {
      proposalStatus: status,
      proposalStatusText: text,
    };
  };
};

export const useAppParams = () => {
  const params = useParams();
  return {
    daoAddress: params.daoId as string,
    proposalAddress: params.proposalId as string,
  };
};

export const useHiddenProposal = (proposalAddress: string) => {
  const { data: proposal } = useProposalQuery(proposalAddress);

  const { data: dao } = useDaoQuery(proposal?.daoAddress || "");

  const { isOwner, isProposalPublisher } = useRole(dao?.daoRoles);

  if (!proposal?.metadata?.hide) return false;
  if (!proposal || !dao) return false;

  return !isOwner && !isProposalPublisher;
};

export const useGetProposalSymbol = (proposalAddress: string) => {
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  return useMemo(
    () => getProposalSymbol(data?.metadata?.votingPowerStrategies),
    [dataUpdatedAt]
  );
};

export const useIsValidatorsProposal = (proposalAddress?: string) => {
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  return useMemo(
    () =>
      getVoteStrategyType(data?.metadata?.votingPowerStrategies) ===
      VotingPowerStrategyType.ValidatorsVote,
    [dataUpdatedAt]
  );
};

export const useProposalStrategyName = (proposalAddress: string) => {
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  return useMemo(() => {
    const type = getVoteStrategyType(data?.metadata?.votingPowerStrategies);

    switch (type) {
      case VotingPowerStrategyType.TonBalance:
      case VotingPowerStrategyType.TonBalanceWithValidators:
        return "TON Balance";
      case VotingPowerStrategyType.JettonBalance:
        return "Jetton Balance";
      case VotingPowerStrategyType.NftCcollection:
        return "NFT Collection";
      case VotingPowerStrategyType.ValidatorsVote:
        return "Validators Vote";
      case VotingPowerStrategyType.JettonBalance_1Wallet1Vote:
      case VotingPowerStrategyType.NftCcollection_1Wallet1Vote:
      case VotingPowerStrategyType.TonBalance_1Wallet1Vote:
        return "1 wallet 1 vote";

      default:
        break;
    }
  }, [dataUpdatedAt]);
};

export const useStrategyAsset = (
  proposalAddress: string
): {
  address: string | undefined;
  type: string;
  image?: string;
  name: string;
  url: string;
  onlyAddress: boolean;
} => {
  const strategyArgs = useStrategyArguments(proposalAddress);

  const metadata = useProposalQuery(proposalAddress)?.data?.metadata;

  const jetton = strategyArgs?.jetton;
  const nft = strategyArgs?.nft;

  const aseetMetadata =
    metadata?.jettonMetadata?.metadata || metadata?.nftMetadata?.metadata;

  const defaultName = jetton ? "Jetton" : nft ? "NFT" : "TON";
  const address = jetton || nft;

  return {
    address,
    type: jetton ? "jetton" : nft ? "nft" : "ton",
    image: aseetMetadata?.image,
    name: aseetMetadata?.name || defaultName,
    url: aseetMetadata?.external_url || getTonScanContractUrl(address),
    onlyAddress: !aseetMetadata,
  };
};

export const useIsOneWalletOneVote = (proposalAddress: string) => {
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  return useMemo(
    () => getIsOneWalletOneVote(data?.metadata?.votingPowerStrategies),
    [dataUpdatedAt]
  );
};

export const useStrategyArguments = (proposalAddress: string) => {
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  return useMemo(() => {
    const arr = STRATEGY_ARGUMENTS.map((it) => ({
      name: it.name,
      value: getStrategyArgument(it.key, data?.metadata?.votingPowerStrategies),
    }));
    return _.omitBy(
      _.chain(arr).keyBy("name").mapValues("value").value(),
      _.isUndefined
    );
  }, [dataUpdatedAt]);
};

export const useIsNftProposal = (proposalAddress: string) => {
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  return useMemo(
    () => isNftProposal(data?.metadata?.votingPowerStrategies),
    [dataUpdatedAt]
  );
};

export const useFormatNumber = (value?: number, decimalScale = 2) => {
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
    value: value || "",
    decimalScale,
  });

  return result.value?.toString();
};

export const useWalletVote = (proposalAddress: string) => {
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);
  const walletAddress = useTonAddress();
  return useMemo(() => {
    return _.find(data?.votes, (it) => it.address === walletAddress);
  }, [dataUpdatedAt, walletAddress]);
};

export const useHideDao = () => {
  const walletAddress = useTonAddress();

  return useCallback(
    (dao: Dao) => {
      const hide = dao.daoMetadata?.metadataArgs.hide;

      const isOwner =
        dao.daoRoles.owner === walletAddress ||
        dao.daoRoles.proposalOwner === walletAddress;
      return hide && !isOwner ? true : false;
    },
    [walletAddress]
  );
};

export default function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const _setSizes = () => {
      setSize({
        width: window.innerWidth,
        height: Webapp.isEnabled ? Webapp.viewPortHeight : window.innerHeight,
      });
    };
    window.addEventListener("resize", _setSizes);
    return () => {
      window.removeEventListener("resize", _setSizes);
    };
  }, []);

  return size;
}
