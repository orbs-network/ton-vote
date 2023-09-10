import { List, LoadMore } from "components";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { StyledEmptyText, StyledFlexColumn, StyledFlexRow } from "styles";
import {
  StyledDaosList,
  StyledDesktopDao,
  StyledEmptyList,
  StyledMobileDao,
} from "../../styles";
import { Dao, DaoLoader } from "../Dao";
import { Dao as DaoType } from "types";
import { useDaosQuery } from "query/getters";
import { useAppQueryParams, useMobile } from "hooks/hooks";
import { useDaosPageTranslations } from "i18n/hooks/useDaosPageTranslations";
import { styled, Theme, Typography } from "@mui/material";
import { TELEGRAM_SUPPORT_GROUP } from "config";
import { Webapp, WebappButton } from "WebApp";
import { isMobile } from "react-device-detect";
import { useAppNavigation } from "router/navigation";
import { errorToast, useErrorToast } from "toasts";
import { useFilteredDaos, useIsWebappSelect } from "../../hooks";
export const DAOS_LIMIT = 11;

export function DaosList() {
  const [limit, setLimit] = useState(DAOS_LIMIT);
  const { isLoading } = useDaosQuery();
  const isWebappSelect = useIsWebappSelect();

  const translations = useDaosPageTranslations();
  const { daoPage } = useAppNavigation();
  const [selectedDao, setSelectedDao] = useState<DaoType>();

  const filteredDaos = useFilteredDaos();

  const onDaoSelect = (dao: DaoType) => {
    if (isWebappSelect) {
      setSelectedDao((prev) => {
        if (prev?.daoId === dao.daoId) {
          return undefined;
        }
        return dao;
      });
    } else {
      daoPage.root(dao.daoAddress);
    }
  };

  const emptyList = !isLoading && !_.size(filteredDaos);

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
            return (
              <Dao
                isSelected={selectedDao?.daoId === dao.daoId}
                onSelect={onDaoSelect}
                key={dao.daoAddress}
                dao={dao}
              />
            );
          })}
          {!isWebappSelect && <NewDao />}
        </StyledDaosList>
      </List>
      <LoadMore
        totalItems={_.size(filteredDaos)}
        amountToShow={limit}
        showMore={() => setLimit((prev) => prev + DAOS_LIMIT)}
        limit={DAOS_LIMIT}
        infiniteScroll={isMobile || Webapp.isEnabled}
      />
      <WebappSelectSpace
        isWebappSelect={isWebappSelect}
        selectedDao={selectedDao}
      />
    </StyledFlexColumn>
  );
}

const WebappSelectSpace = ({
  isWebappSelect,
  selectedDao,
}: {
  isWebappSelect?: boolean;
  selectedDao?: DaoType;
}) => {
  const onClick = () => {
    if (!selectedDao) {
      errorToast("Please select a space");
    } else {
      Webapp.onDaoSelect(selectedDao);
    }
  };
  if (!isWebappSelect || !selectedDao) return null;

  return <WebappButton text="Select Space" onClick={onClick} />;
};

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
