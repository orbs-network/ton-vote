import {  List, LoadMore, Page } from "components";
import {
  StyledEmptyText,
  StyledFlexColumn,
  StyledFlexRow,
  StyledSkeletonLoader,
} from "styles";
import { StyledDao, StyledDaoContent, StyledDaosAmount, StyledDaosList, StyledEmptyList, StyledHeader, StyledSearch } from "./styles";
import { nFormatter } from "utils";
import { Dao } from "types";
import { useMemo, useState } from "react";
import _ from "lodash";
import { DAOS_LIMIT, useDaosListLimit } from "./store";
import { DAOS_PAGE_REFETCH_INTERVAL } from "config";
import { useAppQueryParams, useMobile } from "hooks";
import { DaoListItem } from "./Dao";
import { useDaosPageTranslations } from "i18n/hooks/useDaosPageTranslations";
import { useDaosQuery } from "query/getters";

const filterDaos = (daos: Dao[], searchValue: string) => {
  if (!searchValue) return daos;
  const nameFilter = _.filter(daos, (it) =>
    it.daoMetadata.metadataArgs.name.toLowerCase().includes(searchValue.toLowerCase())
  );
  const addressFilter = _.filter(daos, (it) =>
    it.daoAddress.toLowerCase().includes(searchValue.toLowerCase())
  );

  return _.uniqBy([...nameFilter, ...addressFilter], "daoAddress");
};

export function DaosPage() {
  const {
    data = [],
    isLoading,
    dataUpdatedAt,
  } = useDaosQuery({ refetchInterval: DAOS_PAGE_REFETCH_INTERVAL });
  const { limit, loadMore } = useDaosListLimit();
  const [searchValue, setSearchValue] = useState("");
  const mobile = useMobile()

  const { query, setSearch } = useAppQueryParams();

  const onSearchInputChange = (value: string) => {
    setSearchValue(value);
    setSearch(value);
  };
  const translations = useDaosPageTranslations()

  const filteredDaos = useMemo(
    () => filterDaos(data, searchValue),
    [searchValue, dataUpdatedAt]
  );

  const emptyList = !isLoading && !_.size(filteredDaos);
  return (
    <Page hideBack={true}>
      <StyledFlexColumn alignItems="flex-start" gap={mobile ? 15 : 24}>
        <StyledHeader>
          <StyledSearch
            initialValue={query.search || ""}
            onChange={onSearchInputChange}
            placeholder={translations.searchForDAO}
          />
          <StyledDaosAmount>
            {nFormatter(_.size(data))} {translations.spaces}
          </StyledDaosAmount>
        </StyledHeader>
        <StyledFlexColumn gap={25}>
          <List
            isLoading={isLoading}
            isEmpty={!!emptyList}
            loader={<ListLoader />}
            emptyComponent={
              <StyledEmptyList>
                <StyledFlexRow>
                  <StyledEmptyText>{translations.noSpaces}</StyledEmptyText>
                </StyledFlexRow>
              </StyledEmptyList>
            }
          >
            <StyledDaosList>
              {filteredDaos.map((dao, index) => {
                if (index > limit) return null;
                return <DaoListItem key={dao.daoAddress} dao={dao} />;
              })}
            </StyledDaosList>
          </List>

          <LoadMore
            totalItems={_.size(filteredDaos)}
            amountToShow={limit}
            showMore={loadMore}
            limit={DAOS_LIMIT}
          />
        </StyledFlexColumn>
      </StyledFlexColumn>
    </Page>
  );
}


const ListLoader = () => {
  return (
    <StyledDaosList>
      {_.range(0, 1).map((it, i) => {
        return (
          <StyledDao key={i}>
            <StyledDaoContent>
              <StyledFlexColumn>
                <StyledSkeletonLoader
                  style={{ borderRadius: "50%", width: 70, height: 70 }}
                />
                <StyledSkeletonLoader style={{ width: "70%" }} />
                <StyledSkeletonLoader />
              </StyledFlexColumn>
            </StyledDaoContent>
          </StyledDao>
        );
      })}
    </StyledDaosList>
  );
};
