import { List, LoadMore } from "components";
import _ from "lodash";
import React, { useMemo, useState } from "react";
import { StyledEmptyText, StyledFlexColumn, StyledFlexRow } from "styles";
import { StyledDaosList, StyledDesktopDao, StyledEmptyList, StyledMobileDao } from "../styles";
import { Dao, DaoLoader } from "./Dao";
import { Dao as DaoType } from "types";
import { useDaosQuery } from "query/getters";
import { useAppQueryParams, useMobile } from "hooks/hooks";
import { useDaosPageTranslations } from "i18n/hooks/useDaosPageTranslations";
import { styled, Theme, Typography } from "@mui/material";
import { TELEGRAM_SUPPORT_GROUP } from "config";
export const DAOS_LIMIT = 11;

const filterDaos = (daos: DaoType[], searchValue: string) => {
  if (!searchValue) return daos;
  const nameFilter = _.filter(daos, (it) =>
    it.daoMetadata.metadataArgs.name
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );
  const addressFilter = _.filter(daos, (it) =>
    it.daoAddress.toLowerCase().includes(searchValue.toLowerCase())
  );

  const proposalsFilter = _.filter(daos, (it) => {
    let res = false;
    _.forEach(it.daoProposals, (it) => {
      if (it.toLowerCase().includes(searchValue.toLowerCase())) {
        res = true;
      }
    });
    return res;
  });

  return _.uniqBy(
    [...nameFilter, ...addressFilter, ...proposalsFilter],
    "daoAddress"
  );
};

export function DaosList({
  showNewDao,
  onSelect,
}: {
  showNewDao?: boolean;
  onSelect: (dao: DaoType) => void;
}) {
  const [limit, setLimit] = useState(DAOS_LIMIT);
  const { data = [], isLoading, dataUpdatedAt } = useDaosQuery();
  const {
    query: { search: searchValue },
  } = useAppQueryParams();
  const translations = useDaosPageTranslations();

  const filteredDaos = useMemo(
    () => filterDaos(data, searchValue || ""),
    [searchValue, dataUpdatedAt]
  );

  const emptyList = !isLoading && !_.size(filteredDaos);

  const showMore = () => setLimit((prev) => prev + DAOS_LIMIT);
  return (
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
            return <Dao onSelect={onSelect} key={dao.daoAddress} dao={dao} />;
          })}
          {showNewDao && <NewDao />}
        </StyledDaosList>
      </List>
      <LoadMore
        totalItems={_.size(filteredDaos)}
        amountToShow={limit}
        showMore={showMore}
        limit={DAOS_LIMIT}
      />
    </StyledFlexColumn>
  );
}

const ListLoader = () => {
  return (
    <StyledDaosList>
      {_.range(0, 1).map((it, i) => {
        return <DaoLoader key={i} />;
      })}
    </StyledDaosList>
  );
};


const NewDao = () => {
  const mobile = useMobile();

  const onClick = () => window.open(TELEGRAM_SUPPORT_GROUP, "_blank");

  return mobile ? (
    <StyledNewDaoMobile onClick={onClick}>
      <Typography>Create a new space for your DAO</Typography>
    </StyledNewDaoMobile>
  ) : (
    <StyledNewDaoDestop onClick={onClick}>
      <Typography>Create a new space for your DAO</Typography>
    </StyledNewDaoDestop>
  );
};


const newDaoStyles = (theme: Theme) => ({
  background: "transparent",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  p: {
    fontSize: 17,
    textAlign: "center",
  },
  border:
    theme.palette.mode === "light"
      ? "1px dashed rgba(0,0,0 , 0.15)"
      : "1px dashed rgba(255,255,255, 0.2)",
  "&:hover": {
    border: `1px dashed ${theme.palette.primary.main}`,
  },
});

const StyledNewDaoMobile = styled(StyledMobileDao)(({ theme }) => ({
  height: 80,
  ...newDaoStyles(theme),
  p: {
    fontSize: 15,
  },
}));

const StyledNewDaoDestop = styled(StyledDesktopDao)(({ theme }) => ({
  ...newDaoStyles(theme),
}));
