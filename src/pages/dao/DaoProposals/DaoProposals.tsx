import { Box, styled, Typography } from "@mui/material";
import { FadeElement, LoadMore, Select } from "components";
import _ from "lodash";
import { ReactNode, useMemo, useState } from "react";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { DaoProposal, ProposalStatus, SelectOption } from "types";
import { StringParam, useQueryParam } from "use-query-params";
import { getProposalStatus } from "utils";
import { useDaoProposalsQuery } from "../hooks";
import { ProposalComponent } from "./Proposal";
import { StyledProposalContent, StyledProposalsContainer } from "./styles";

const SIZE = 7;

interface Option extends SelectOption {
  value: ProposalStatus | string;
}

const options: Option[] = [
  { text: "All", value: "all" },
  { text: "Active", value: ProposalStatus.ACTIVE },
  { text: "Pending", value: ProposalStatus.PENDING },
  { text: "Closed", value: ProposalStatus.CLOSED },
];

export function DaoProposals() {
  const { data, isLoading } = useDaoProposalsQuery();
  const [itemsAmount, setItemsAmount] = useState(SIZE);
  const [filterValue, setFilterValue] = useState<string>(options[0].value);
  // const [queryParamState, setQueryParamState] = useQueryParam(
  //   "state",
  //   StringParam
  // );

  const showMore = () => {
    setItemsAmount((prev) => prev + SIZE);
  };

  const onSelect = (value: string) => {
    setFilterValue(value);
    setItemsAmount(SIZE);
    // setQueryParamState(value);
  };

  // const filteredProposals = useMemo(() => {
  //   return _.filter(daoProposals, (proposal) => {
  //     if (filterValue === "all") return true;
  //     return (
  //       getProposalStatus(proposal.startDate, proposal.endDate) === filterValue
  //     );
  //   });
  // }, [_.size(daoProposals), filterValue]);

  // const hideLoadMore = _.size(filteredProposals) < SIZE;

  const emptyList = !isLoading && !_.size(data?.proposalAddresses);

  return (
    <FadeElement>
      <StyledProposalsContainer
        title="Proposals"
        headerChildren={
          <Select
            options={options}
            selected={filterValue}
            onSelect={onSelect}
          />
        }
      >
        <StyledFlexColumn gap={20}>
          {isLoading ? (
            <ListLoader />
          ) : (
            data?.proposalAddresses?.map((address, index) => {
              if (index >= itemsAmount) return null;
              return <ProposalComponent address={address} key={address.toString()} />;
            })
          )}
        </StyledFlexColumn>
        {emptyList && <StyledEmptyList>No Proposals</StyledEmptyList>}
        <LoadMore
          hide={isLoading}
          loadMoreOnScroll={itemsAmount > SIZE}
          showMore={showMore}
          isFetchingNextPage={false}
        />
      </StyledProposalsContainer>
    </FadeElement>
  );
}

const StyledEmptyList = styled(Typography)({
  fontSize: 20,
  fontWeight: 700
})

const ListLoader = () => {
  return (
    <StyledFlexColumn gap={20}>
      {_.range(0, 3).map((it, i) => {
        return <LoadingProposal key={i} />;
      })}
    </StyledFlexColumn>
  );
};

const LoadingProposal = () => {
  return (
    <StyledProposalContent sx={{ width: "100%" }}>
      <StyledFlexColumn alignItems="flex-start">
        <StyledFlexRow justifyContent="space-between">
          <StyledSkeletonLoader height={20} width={80} />
          <StyledSkeletonLoader height={20} width={50} />
        </StyledFlexRow>
        <StyledSkeletonLoader height={20} width={180} />
        <StyledSkeletonLoader height={20} width={220} />
      </StyledFlexColumn>
    </StyledProposalContent>
  );
};
