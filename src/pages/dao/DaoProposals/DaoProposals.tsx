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
  const { data, isLoading, error } = useDaoProposalsQuery(daoAddress);

  console.log({ data });
  

  const [renderedProposalsCount, setRenderedProposalsCount] = useState(SIZE);
  const [filterValue, setFilterValue] = useState<string>(options[0].value);
  const [queryParamState, setQueryParamState] = useQueryParam(
    "state",
    StringParam
  );

  const showMore = () => {
    setRenderedProposalsCount((prev) => prev + SIZE);
  };

  const onSelect = (value: string) => {
    setFilterValue(value);
    setRenderedProposalsCount(SIZE);
    setQueryParamState(value);
  };

  const emptyList = !isLoading && !_.size(data?.proposalAddresses);


  const hideLoadMoreButton = isLoading || renderedProposalsCount >= SIZE;

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
              if (index >= renderedProposalsCount) return null;
              return (
                <ProposalComponent address={address} key={address.toString()} />
              );
            })
          )}
        </StyledFlexColumn>
        {emptyList && <StyledEmptyList>No Proposals</StyledEmptyList>}
        <LoadMore
          hide={hideLoadMoreButton}
          loadMoreOnScroll={renderedProposalsCount > SIZE}
          showMore={showMore}
          isFetchingNextPage={false}
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


