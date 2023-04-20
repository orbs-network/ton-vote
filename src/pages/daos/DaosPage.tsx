import { styled, Typography, useTheme } from "@mui/material";
import { Container, List, LoadMore, Page, Search } from "components";
import { useDaosQuery } from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { AiFillEyeInvisible } from "react-icons/ai";
import {
  StyledDao,
  StyledDaoAvatar,
  StyledDaoContent,
  StyledDaosList,
  StyledJoinDao,
} from "./styles";
import { isOwner, makeElipsisAddress } from "utils";
import { Dao } from "types";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import _ from "lodash";
import { StringParam, useQueryParam } from "use-query-params";
import { OLD_DAO } from "data";
import { DAOS_LIMIT, useDaosListLimit } from "./store";
import { useConnection } from "ConnectionProvider";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import { Translation } from "i18n";
import { DAOS_PAGE_REFETCH_INTERVAL } from "config";

const filterDaos = (daos: Dao[], searchValue: string) => {
  if (!searchValue) return daos;
  const nameFilter = _.filter(daos, (it) =>
    it.daoMetadata.name.toLowerCase().includes(searchValue.toLowerCase())
  );
  const addressFilter = _.filter(daos, (it) =>
    it.daoAddress.toLowerCase().includes(searchValue.toLowerCase())
  );
  return _.uniqBy([...nameFilter, ...addressFilter], "daoAddress");
};

export function DaosPage() {
  const { data = [], isLoading } = useDaosQuery(DAOS_PAGE_REFETCH_INTERVAL);
  const { limit, loadMore } = useDaosListLimit();
  const [searchValue, setSearchValue] = useState("");

  const [queryParam, setQueryParam] = useQueryParam("q", StringParam);

  const onSearchInputChange = (value: string) => {
    setSearchValue(value);
    setQueryParam(value || undefined, "pushIn");
  };
  const { t } = useTranslation();

  const filteredDaos = filterDaos(data, searchValue);

  const emptyList = !isLoading && !_.size(data);
  return (
    <Page>
      <StyledFlexColumn alignItems="flex-start" gap={24}>
        <StyledFlexRow justifyContent="space-between">
          <StyledSearch
            initialValue={queryParam as string}
            onChange={onSearchInputChange}
          />
          <StyledDaosAmount>
            <Typography>
              {_.size(data) + 1} {t("forums")}
            </Typography>
          </StyledDaosAmount>
        </StyledFlexRow>
        <StyledFlexColumn gap={25}>
          <List
            isLoading={isLoading}
            isEmpty={!!emptyList}
            loader={<ListLoader />}
            emptyComponent={
              <StyledEmptyList>There are no Daos yet</StyledEmptyList>
            }
          >
            <StyledDaosList>
              <DaoListItem dao={OLD_DAO} />
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

const StyledDaosAmount = styled(Container)({
  padding: "10px 20px",
  borderRadius: 20,
  width: "unset",
  p: {
    fontSize: 13,
  },
});

const StyledEmptyList = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
});

const StyledSearch = styled(Search)({
  maxWidth: 400,
  width: "100%",
});

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

const useJoinDao = () => {
  return useMutation(async () => {});
};

export const DaoListItem = ({ dao }: { dao: Dao }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { daoPage } = useAppNavigation();
  const { mutate } = useJoinDao();
  const { daoMetadata } = dao;
  const walletAddress = useConnection().address;
  const theme = useTheme();

  const join = (e: any) => {
    e.stopPropagation();
    mutate();
  };

  if (dao.daoMetadata.hide && !isOwner(walletAddress, dao.daoRoles))
    return null;

  return (
    <StyledDao ref={ref} onClick={() => daoPage.root(dao.daoAddress)}>
      <StyledDaoContent className="container" hover>
        {dao.daoMetadata.hide && (
          <StyledHiddenIcon>
            <AiFillEyeInvisible
              style={{ width: 25, height: 25 }}
              color={theme.palette.primary.main}
            />
          </StyledHiddenIcon>
        )}
        {isVisible ? (
          <StyledFlexColumn>
            <StyledDaoAvatar src={daoMetadata?.avatar} />
            <Typography className="title">{daoMetadata?.name}</Typography>
            <Typography className="address">
              {makeElipsisAddress(dao.daoAddress, 6)}
            </Typography>
          </StyledFlexColumn>
        ) : null}
      </StyledDaoContent>
    </StyledDao>
  );
};


const StyledHiddenIcon = styled(Box)({
  position:'absolute',
  left: 10,
  top: 10
})