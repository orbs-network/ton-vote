import { Box } from "@mui/material";
import { List, LoadMore } from "components";
import { useAppParams, useAppQueryParams, useMobile } from "hooks/hooks";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import _ from "lodash";
import { useDaoQuery } from "query/getters";
import { useState } from "react";
import { StyledEmptyText, StyledFlexColumn } from "styles";
import { ProposalStatus, SelectOption } from "types";
import { ProposalLoader } from "../ProposalLoader";
import { Proposal } from "./Proposal/Proposal";
import {
  StyledEmptyList,
  StyledProposalsContainer,
  StyledSearch,
} from "./styles";
import { MainButton } from '@twa-dev/sdk/react'
import { showToast } from "toasts";

const LIMIT = 10;

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

  const onSearchInputChange = (value: string) => {
    setSearch(value);
  };
  const [filterValue, setFilterValue] = useState<string>(
    query.proposalState || options[0].value
  );

  const onSelect = (value: string) => {
    setFilterValue(value);
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
  const translations = useDaoPageTranslations();
  const mobile = useMobile();
  const showMore = () => {
    setAmount((prev) => prev + LIMIT);
  };
  const { daoAddress } = useAppParams();

  const { data, isLoading } = useDaoQuery(daoAddress);

  return (
    <StyledProposalsContainer
      title={translations.proposals}
      headerChildren={!mobile ? <ProposalsSearch /> : undefined}
    >
      {mobile && <ProposalsSearch />}
      <Box style={{ position: "relative", width: "100%" }}>
        {!isLoading && <EmptyList />}
        <StyledFlexColumn gap={15} style={{ zIndex: 10, position: "relative" }}>
          <List isLoading={isLoading} loader={<ListLoader />}>
            {data?.daoProposals?.map((proposalAddress, index) => {
              if (index >= amount) return null;
              return (
                <Proposal
                  key={proposalAddress}
                  proposalAddress={proposalAddress}
                />
              );
            })}
          </List>
        </StyledFlexColumn>
      </Box>
      <LoadMore
        totalItems={_.size(data?.daoProposals)}
        amountToShow={amount}
        showMore={showMore}
        limit={LIMIT}
      />
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
