import { Chip, styled, Typography } from "@mui/material";
import { Container, List, LoadMore, Search } from "components";
import { useDaoAddress, useIsOwner } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { useState } from "react";
import { Link } from "react-router-dom";
import { appNavigation } from "router";
import { StyledTitle, StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalStatus, SelectOption } from "types";
import { StringParam, useQueryParam } from "use-query-params";
import { ProposalLoader } from "../ProposalLoader";
import { ProposalComponent } from "./Proposal";
import { StyledProposalOwner, StyledProposalsHeader } from "./styles";

interface Option extends SelectOption {
  value: ProposalStatus | string;
}

const useFilterValue = () => {
  return useQueryParam("state", StringParam);
};

const LIMIT = 2

// const options: Option[] = [
//   { text: "All", value: "all" },
//   { text: "Active", value: ProposalStatus.ACTIVE },
//   { text: "Closed", value: ProposalStatus.CLOSED },
//   { text: "Not started", value: ProposalStatus.NOT_STARTED },
// ];

const ProposalsCount = () => {
  const daoAddress = useDaoAddress();
  const { data } = useDaoQuery(daoAddress);

  const size = _.size(data?.daoProposals);

  return size ? <Chip label={_.size(data?.daoProposals)} /> : null;
};

export function ProposalsList() {
  const daoAddress = useDaoAddress();
  const [amount, setAmount] = useState(LIMIT);
  const [searchValue, setSearchValue] = useState('')

  const showMore = () => {
    setAmount((prev) => prev + LIMIT);
  }

  const { data, isLoading } = useDaoQuery(daoAddress);
  const [queryParamState] = useFilterValue();

  const isEmpty = !isLoading && !_.size(data?.daoProposals);

  return (
    <StyledFlexColumn gap={15}>
      <StyledProposalsHeader>
        <StyledFlexRow justifyContent='space-between'>
          <StyledTitle>Proposals</StyledTitle>
          <StyledSearch initialValue="" onChange={setSearchValue} />
        </StyledFlexRow>
      </StyledProposalsHeader>
      <StyledFlexColumn gap={15}>
        <List
          isEmpty={isEmpty}
          isLoading={isLoading}
          loader={<ListLoader />}
          emptyComponent={<EmptyList />}
        >
          {data?.daoProposals?.map((proposalAddress, index) => {
            if (index > amount) return null;
            return (
              <ProposalComponent
                filterValue={queryParamState as ProposalStatus | undefined}
                key={proposalAddress}
                proposalAddress={proposalAddress}
              />
            );
          })}
        </List>
      </StyledFlexColumn>
      <LoadMore
        totalItems={_.size(data?.daoProposals)}
        amountToShow={amount}
        showMore={showMore}
        limit={LIMIT}
      />
    </StyledFlexColumn>
  );
}

const StyledSearch = styled(Search)({
  maxWidth: 260,
  width: '100%',
})

const EmptyList = () => {
  const daoAddress = useDaoAddress();
  const { isDaoOwner, isProposalOnwer } = useIsOwner(daoAddress);
  const isOwner = isDaoOwner || isProposalOnwer;

  return (
    <StyledEmptyList>
      <StyledFlexRow>
        <Typography>No Proposals</Typography>
        {isOwner && (
          <Link
            color="primary"
            className="create"
            to={appNavigation.daoPage.create(daoAddress)}
          >
            Create
          </Link>
        )}
      </StyledFlexRow>
    </StyledEmptyList>
  );
};

// const DaoFilter = () => {
//   const [queryParamState, setQueryParamState] = useFilterValue();

//   const [filterValue, setFilterValue] = useState<string>(
//     queryParamState || options[0].value
//   );

//   const onSelect = (value: string) => {
//     setFilterValue(value);
//     setQueryParamState(value === "all" ? undefined : value);
//   };

//   return (
//     <Select options={options} selected={filterValue} onSelect={onSelect} />
//   );
// };

// const LoadMoreProposals = ({ emptyList }: { emptyList: boolean }) => {
//   const daoAddress = useDaoAddress();

//   const loadMoreOnScroll = false
//   const hide = false

//   return (
//     <LoadMore
//       hide={hide}
//       loadMoreOnScroll={loadMoreOnScroll}
//       showMore={() => {}}
//       isFetchingNextPage={false}
//     />
//   );
// };

const StyledEmptyList = styled(Container)({
  p: {
    fontSize: 20,
    fontWeight: 700,
  },
});

const ListLoader = () => {
  return (
    <>
      {_.range(0, 2).map((it, i) => {
        return <ProposalLoader key={i} />;
      })}
    </>
  );
};
