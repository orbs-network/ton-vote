import { styled, Typography } from "@mui/material";
import { Button, Container, Header, List, LoadMore, Search } from "components";
import { DAO_REFETCH_INTERVAL } from "config";
import { useDaoAddress } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyledFlexColumn } from "styles";
import { ProposalStatus, SelectOption } from "types";
import { DaoDescription } from "../DaoDescription";
import { ProposalLoader } from "../ProposalLoader";
import { useFilterValueByState, useFilterValueByText } from "./hooks";
import { ProposalComponent } from "./Proposal";
const LIMIT = 10;

interface Option extends SelectOption {
  value: ProposalStatus | string;
}

const useOptions = (): Option[] => {
  const { t } = useTranslation();

  return [
    { text: t("all"), value: "all" },
    { text: t("active"), value: ProposalStatus.ACTIVE },
    { text: t("ended"), value: ProposalStatus.CLOSED },
    { text: t("notStarted"), value: ProposalStatus.NOT_STARTED },
  ];
};

const ProposalsSearch = () => {
  const options = useOptions();
  const [queryParamByText, setQueryParamByText] = useFilterValueByText();
  const [queryParamByState, setQueryParamByState] = useFilterValueByState();

  const onSearchInputChange = (value: string) => {
    setQueryParamByText(value || undefined, "pushIn");
  };
  const [filterValue, setFilterValue] = useState<string>(
    queryParamByState || options[0].value
  );

  const onSelect = (value: string) => {
    setFilterValue(value);
    setQueryParamByState(value === "all" ? undefined : value);
  };

  return (
    <StyledSearch
      filterOptions={options}
      filterValue={filterValue}
      onFilterSelect={onSelect}
      initialValue={queryParamByText || ""}
      onChange={onSearchInputChange}
    />
  );
};

export function ProposalsList() {
  const daoAddress = useDaoAddress();
  const [amount, setAmount] = useState(LIMIT);

  const showMore = () => {
    setAmount((prev) => prev + LIMIT);
  };

  const { data, isLoading } = useDaoQuery(
    daoAddress,
    DAO_REFETCH_INTERVAL,
    10_000
  );

  const isEmpty = !isLoading && !_.size(data?.daoProposals);

  return (
    <StyledFlexColumn gap={20}>
      <DaoDescription />
      <StyledHeader title="Proposals" component={<ProposalsSearch />} />
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

const StyledHeader = styled(Header)({
  marginBottom: 0
});

const StyledSearch = styled(Search)({
  maxWidth: 360,
  width: "100%",
});

const EmptyList = () => {
  return (
    <StyledEmptyList>
      <StyledFlexColumn>
        <Typography>No Proposals</Typography>
      </StyledFlexColumn>
    </StyledEmptyList>
  );
};

const StyledCreateDao = styled(Button)({
  padding: "8px 20px",
  height: "unset",
});

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
