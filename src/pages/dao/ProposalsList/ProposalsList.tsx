import { Box, styled, Typography } from "@mui/material";
import {Container, Header, List, LoadMore, Search } from "components";
import { DAO_REFETCH_INTERVAL } from "config";
import { useDaoAddress } from "hooks";
import { t } from "i18next";
import _ from "lodash";
import { useDaoQuery } from "query/queries";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyledEmptyText, StyledFlexColumn } from "styles";
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

  return (
    <StyledFlexColumn gap={20}>
      <DaoDescription />
      <StyledHeader title="Proposals" component={<ProposalsSearch />} />
      <Box style={{ position: "relative", width:'100%' }}>
       {!isLoading &&  <EmptyList />}
        <StyledFlexColumn gap={15} style={{zIndex: 10, position:'relative'}}>
          <List  isLoading={isLoading} loader={<ListLoader />}>
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
        </StyledFlexColumn>
        <LoadMore
          totalItems={_.size(data?.daoProposals)}
          amountToShow={amount}
          showMore={showMore}
          limit={LIMIT}
        />
      </Box>
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
  const {t} = useTranslation()
  return (
    <StyledEmptyList>
      <StyledFlexColumn>
        <StyledEmptyText>{t("emptyProposals")}</StyledEmptyText>
      </StyledFlexColumn>
    </StyledEmptyList>
  );
};

const StyledEmptyList = styled(Container)({
  position:'absolute',
  width: "100%",
  top: 0,
 
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
