import { Box, styled, Typography } from "@mui/material";
import { FadeElement, LoadMore, Select } from "components";
import { useDaoAddress, useProposalAddress } from "hooks";
import _ from "lodash";
import { useDaoProposalsQuery } from "query/queries";
import { useState } from "react";
import { StyledFlexColumn, StyledSkeletonLoader } from "styles";
import { ProposalStatus, SelectOption } from "types";
import { StringParam, useQueryParam } from "use-query-params";
import { ProposalComponent } from "./Proposal";
import { StyledProposalsContainer } from "./styles";

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
  const daoAddress = useDaoAddress()
  const { data, isLoading, error, fetchNextPage, isFetchingNextPage, hasNextPage } = useDaoProposalsQuery(daoAddress);

  const noMore = !_.size(_.last(data?.pages)?.proposalAddresses);
    
  const [filterValue, setFilterValue] = useState<string>(options[0].value);
  const [queryParamState, setQueryParamState] = useQueryParam(
    "state",
    StringParam
  );



  const onSelect = (value: string) => {
    setFilterValue(value);
    setQueryParamState(value);
  };

  const emptyList = false



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
            data?.pages?.map((page) => {
              return page.proposalAddresses?.map((address, index) => {
                return <ProposalComponent key={index} address={address} />;
              });
            })
          )}
        </StyledFlexColumn>
        {emptyList && <StyledEmptyList>No Proposals</StyledEmptyList>}
        <LoadMore
          hide={noMore}
          loadMoreOnScroll={false}
          showMore={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </StyledProposalsContainer>
    </FadeElement>
  );
}

const StyledEmptyList = styled(Typography)({
  fontSize: 20,
  fontWeight: 700,
});

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
  return <StyledSkeletonLoader style={{ width: "100%", height: 100 }} />;
};


