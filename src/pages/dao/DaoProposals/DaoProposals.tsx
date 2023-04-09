import { Box, styled, Typography } from "@mui/material";
import { List, FadeElement, Loader, LoadMore, Select } from "components";
import { PROPOSALS_LIMIT } from "config";
import { useDaoAddress, useIsOwner } from "hooks";
import _ from "lodash";
import { useDaoProposalsQuery, useDaoRolesQuery } from "query/queries";
import { useState } from "react";
import { Link } from "react-router-dom";
import { appNavigation, useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalStatus, SelectOption } from "types";
import { StringParam, useQueryParam } from "use-query-params";
import { ProposalComponent } from "./Proposal";
import { StyledLoader, StyledProposalsContainer } from "./styles";

interface Option extends SelectOption {
  value: ProposalStatus | string;
}

const useFilterValue = () => {
  return useQueryParam("state", StringParam);
};

const options: Option[] = [
  { text: "All", value: "all" },
  { text: "Active", value: ProposalStatus.ACTIVE },
  { text: "Closed", value: ProposalStatus.CLOSED },
  { text: "Not started", value: ProposalStatus.NOT_STARTED },
];

export function DaoProposals() {
  const daoAddress = useDaoAddress();
  
  const { data, isLoading, error } = useDaoProposalsQuery(daoAddress);
    console.log({ data });

  const [queryParamState] = useFilterValue();

  const emptyList =
    data && _.size(_.first(data.pages)?.proposalAddresses) === 0;

  return (
    <FadeElement>
      <StyledProposalsContainer
        title="Proposals"
        headerChildren={<DaoFilter />}
      >
        <StyledFlexColumn gap={20}>
          <List
            isEmpty={!!emptyList}
            isLoading={isLoading}
            loader={<ListLoader />}
            emptyComponent={<EmptyList />}
          >
            {data?.pages?.map((page) => {
              return page.proposalAddresses?.map((address, index) => {
                return (
                  <ProposalComponent
                    filterValue={queryParamState as ProposalStatus | undefined}
                    key={index}
                    address={address}
                  />
                );
              });
            })}
          </List>
        </StyledFlexColumn>
        <LoadMoreProposals />
      </StyledProposalsContainer>
    </FadeElement>
  );
}

const EmptyList = () => {
  const daoAddress = useDaoAddress();
  const { isDaoOwner, isProposalOnwer } = useIsOwner(daoAddress);
  const isOwner = isDaoOwner || isProposalOnwer;

  return (
    <StyledEmptyList>
      <Typography>No Proposals</Typography>
      {isOwner && (
        <Link color="primary" className="create" to={appNavigation.daoPage.create(daoAddress)}>
          Create
        </Link>
      )}
    </StyledEmptyList>
  );
};

const DaoFilter = () => {
  const [queryParamState, setQueryParamState] = useFilterValue();

  const [filterValue, setFilterValue] = useState<string>(
    queryParamState || options[0].value
  );

  const onSelect = (value: string) => {
    setFilterValue(value);
    setQueryParamState(value === "all" ? undefined : value);
  };

  return (
    <Select options={options} selected={filterValue} onSelect={onSelect} />
  );
};

const LoadMoreProposals = () => {
  const daoAddress = useDaoAddress();
  const { data, isLoading, fetchNextPage, isFetchingNextPage } =
    useDaoProposalsQuery(daoAddress);
  const loadMoreOnScroll = _.size(data?.pages) > 1 && !isFetchingNextPage;
  const hide =
    isLoading ||
    _.size(_.last(data?.pages)?.proposalAddresses) < PROPOSALS_LIMIT;

  return (
    <LoadMore
      hide={hide}
      loadMoreOnScroll={loadMoreOnScroll}
      showMore={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};

const StyledEmptyList = styled(StyledFlexRow)({
  p: {
    fontSize: 20,
    fontWeight: 700,
  },
});

const ListLoader = () => {
  return (
    <StyledFlexColumn gap={20}>
      {_.range(0, 1).map((it, i) => {
        return <StyledLoader key={i} />;
      })}
    </StyledFlexColumn>
  );
};
