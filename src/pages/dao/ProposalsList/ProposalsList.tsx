import { Box } from "@mui/material";
import { QueryClient, useQueries, useQueryClient } from "@tanstack/react-query";
import { api } from "api";
import { List, LoadMore } from "components";
import { QueryKeys } from "config";
import { useAppParams, useAppQueryParams, useMobile } from "hooks/hooks";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import _ from "lodash";
import { mock } from "mock/mock";
import { useDaoQuery } from "query/getters";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyledEmptyText, StyledFlexColumn } from "styles";
import {
  Proposal as ProposalType,
  ProposalStatus,
  SelectOption,
} from "types";
import { ProposalLoader } from "../ProposalLoader";
import { Proposal } from "./Proposal/Proposal";
import {
  StyledEmptyList,
  StyledProposalsContainer,
  StyledSearch,
} from "./styles";
const LIMIT = 10;

const getProposalStartTime = (proposal?: ProposalType | null) => {
  return Number(proposal?.metadata?.proposalStartTime || 0);
};

const getProposalSortDate = async (
  proposalAddress: string,
  queryClient: QueryClient,
  signal?: AbortSignal
) => {
  const cachedProposal = queryClient.getQueryData<ProposalType | null>([
    QueryKeys.PROPOSAL,
    proposalAddress,
  ]);
  const cachedDate = getProposalStartTime(cachedProposal);

  if (cachedDate) return cachedDate;

  const mockDate = getProposalStartTime(mock.getMockProposal(proposalAddress));

  if (mockDate) return mockDate;

  const foundationProposals = await (
    await import("data/foundation/data")
  ).getFoundationProposals();
  const foundationDate = getProposalStartTime(
    foundationProposals[proposalAddress]
  );

  if (foundationDate) return foundationDate;

  try {
    return getProposalStartTime(await api.getProposal(proposalAddress, signal));
  } catch (error) {
    return 0;
  }
};

const useSortedProposalAddresses = (proposalAddresses?: string[]) => {
  const queryClient = useQueryClient();
  const proposalDateQueries = useQueries({
    queries: (proposalAddresses || []).map((proposalAddress) => ({
      queryKey: [QueryKeys.PROPOSAL_SORT_DATE, proposalAddress],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        getProposalSortDate(proposalAddress, queryClient, signal),
      enabled: !!proposalAddress,
      staleTime: Infinity,
      retry: 0,
    })),
  });
  const proposalAddressesKey = proposalAddresses?.join("|") || "";
  const proposalDatesKey = proposalDateQueries
    .map((query) => `${query.isFetched ? 1 : 0}:${query.data || 0}`)
    .join("|");

  return useMemo(() => {
    if (!proposalAddresses?.length) return proposalAddresses;

    const sortDatesReady = proposalDateQueries.every((query) => query.isFetched);

    if (!sortDatesReady) return proposalAddresses;

    const originalIndexByAddress = new Map(
      proposalAddresses.map((proposalAddress, index) => [
        proposalAddress,
        index,
      ])
    );
    const dateByAddress = new Map(
      proposalAddresses.map((proposalAddress, index) => [
        proposalAddress,
        Number(proposalDateQueries[index]?.data || 0),
      ])
    );

    return _.orderBy(
      proposalAddresses,
      [
        (proposalAddress) =>
          dateByAddress.get(proposalAddress) || Number.MAX_SAFE_INTEGER,
        (proposalAddress) => originalIndexByAddress.get(proposalAddress) || 0,
      ],
      ["desc", "asc"]
    );
  }, [proposalAddressesKey, proposalDatesKey]);
};

interface Option extends SelectOption {
  value: ProposalStatus | string;
}

const useOptions = (): Option[] => {
  const translations = useCommonTranslations();

  return [
    { text: translations.all, value: "all" },
    { text: translations.active, value: ProposalStatus.ACTIVE },
    { text: translations.ended, value: ProposalStatus.CLOSED },
    { text: translations.notStarted, value: ProposalStatus.NOT_STARTED },
  ];
};

const ProposalsSearch = () => {
  const options = useOptions();
  const { query, setProposalState, setSearch } = useAppQueryParams();
  const filterValue = query.proposalState || options[0].value;

  const onSearchInputChange = (value: string) => {
    setSearch(value);
  };

  const onSelect = (value: string) => {
    setProposalState(value === "all" ? undefined : value);
  };

  return (
    <StyledSearch
      filterOptions={options}
      filterValue={filterValue}
      onFilterSelect={onSelect}
      initialValue={query.search || ""}
      onChange={onSearchInputChange}
    />
  );
};

export function ProposalsList() {
  const [amount, setAmount] = useState(LIMIT);
  const [proposalVisibility, setProposalVisibility] = useState<{
    [proposalAddress: string]: boolean;
  }>({});
  const translations = useDaoPageTranslations();
  const mobile = useMobile();
  const showMore = () => {
    setAmount((prev) => prev + LIMIT);
  };
  const { daoAddress } = useAppParams();
  const { query } = useAppQueryParams();

  const { data, isLoading } = useDaoQuery(daoAddress);
  const sortedDaoProposals = useSortedProposalAddresses(data?.daoProposals);
  const hasActiveFilter = !!query.proposalState || !!query.search;
  const hasProposals = !!sortedDaoProposals?.length;
  const proposalAddresses = hasActiveFilter
    ? sortedDaoProposals
    : sortedDaoProposals?.slice(0, amount);
  const proposalAddressesKey = useMemo(
    () => proposalAddresses?.join("|") || "",
    [proposalAddresses]
  );
  const visibleProposalCount =
    proposalAddresses?.filter(
      (proposalAddress) => proposalVisibility[proposalAddress]
    ).length || 0;
  const proposalVisibilitySettled =
    !proposalAddresses?.length ||
    proposalAddresses.every((proposalAddress) =>
      Object.prototype.hasOwnProperty.call(proposalVisibility, proposalAddress)
    );
  const showEmptyList =
    !isLoading &&
    (!hasProposals ||
      (hasActiveFilter && proposalVisibilitySettled && !visibleProposalCount));

  const updateProposalVisibility = useCallback(
    (proposalAddress: string, visible: boolean) => {
      setProposalVisibility((prev) => {
        if (prev[proposalAddress] === visible) return prev;

        return {
          ...prev,
          [proposalAddress]: visible,
        };
      });
    },
    []
  );

  useEffect(() => {
    setAmount(LIMIT);
  }, [daoAddress, query.proposalState, query.search]);

  useEffect(() => {
    setProposalVisibility({});
  }, [proposalAddressesKey, query.proposalState, query.search]);

  return (
    <StyledProposalsContainer
      title={translations.proposals}
      headerChildren={!mobile ? <ProposalsSearch /> : undefined}
    >
      {mobile && <ProposalsSearch />}
      <Box style={{ position: "relative", width: "100%" }}>
        {showEmptyList && <EmptyList />}
        <StyledFlexColumn gap={15} style={{ zIndex: 10, position: "relative" }}>
          <List isLoading={isLoading} loader={<ListLoader />}>
            {proposalAddresses?.map((proposalAddress) => {
              return (
                <Proposal
                  key={proposalAddress}
                  proposalAddress={proposalAddress}
                  onVisibilityChange={updateProposalVisibility}
                />
              );
            })}
          </List>
        </StyledFlexColumn>
      </Box>
      {!hasActiveFilter && (
        <LoadMore
          totalItems={_.size(data?.daoProposals)}
          amountToShow={amount}
          showMore={showMore}
          limit={LIMIT}
        />
      )}
    </StyledProposalsContainer>
  );
}

const EmptyList = () => {
  const translations = useDaoPageTranslations();
  return (
    <StyledEmptyList>
      <StyledFlexColumn>
        <StyledEmptyText>{translations.emptyProposals}</StyledEmptyText>
      </StyledFlexColumn>
    </StyledEmptyList>
  );
};

const ListLoader = () => {
  return (
    <>
      {_.range(0, 1).map((it, i) => {
        return <ProposalLoader key={i} />;
      })}
    </>
  );
};

export default ProposalsList;
