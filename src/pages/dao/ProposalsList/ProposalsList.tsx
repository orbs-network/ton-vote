import { Chip, styled, Typography } from "@mui/material";
import { Button, Container, Header, List, LoadMore, Search } from "components";
import { DAO_REFETCH_INTERVAL } from "config";
import { useDaoAddress, useIsOwner } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { useState } from "react";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalStatus, SelectOption } from "types";
import { StringParam, useQueryParam } from "use-query-params";
import { ProposalLoader } from "../ProposalLoader";
import { ProposalComponent } from "./Proposal";

interface Option extends SelectOption {
  value: ProposalStatus | string;
}

const useFilterValue = () => {
  return useQueryParam("state", StringParam);
};

const LIMIT = 10;

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
  const [searchValue, setSearchValue] = useState("");

  const showMore = () => {
    setAmount((prev) => prev + LIMIT);
  };

  const { data, isLoading } = useDaoQuery(
    daoAddress,
    DAO_REFETCH_INTERVAL,
    5_000
  );
  const [queryParamState] = useFilterValue();

  const isEmpty = !isLoading && !_.size(data?.daoProposals);

  return (
    <StyledFlexColumn gap={0}>
      <Header
        title="Proposals"
        component={<StyledSearch initialValue="" onChange={setSearchValue} />}
      />
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
        <LoadMore
          totalItems={_.size(data?.daoProposals)}
          amountToShow={amount}
          showMore={showMore}
          limit={LIMIT}
        />
      </StyledFlexColumn>
    </StyledFlexColumn>
  );
}

const StyledSearch = styled(Search)({
  maxWidth: 260,
  width: "100%",
});

const EmptyList = () => {
  const daoAddress = useDaoAddress();
  const navigation = useAppNavigation();
  const { isDaoOwner, isProposalOnwer } = useIsOwner(daoAddress);
  const isOwner = isDaoOwner || isProposalOnwer;

  return (
    <StyledEmptyList>
      <StyledFlexColumn>
        <Typography>No Proposals</Typography>
        {isOwner && (
          <StyledCreateDao onClick={() => navigation.daoPage.createProposal(daoAddress)}>
            Create first proposal
          </StyledCreateDao>
        )}
      </StyledFlexColumn>
    </StyledEmptyList>
  );
};

const StyledCreateDao = styled(Button)({
  padding: '8px 20px',
  height:'unset'
})

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
  width: "100%",
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
