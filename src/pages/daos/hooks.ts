import { useAppQueryParams, useHideDao } from "hooks/hooks";
import _ from "lodash";
import { useDaosQuery } from "query/getters";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Dao } from "types";

const filterDaos = (daos: Dao[], searchValue: string) => {
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

export const useFilteredDaos = () => {
  const { data, dataUpdatedAt } = useDaosQuery();
  const hideDaoCallback = useHideDao();

  const {
    query: { search: searchValue },
  } = useAppQueryParams();

  return useMemo(() => {
    const filterHidden = _.compact(
      _.filter(data, (it) => !hideDaoCallback(it))
    );
    return filterDaos(filterHidden, searchValue || "");
  }, [searchValue, dataUpdatedAt, hideDaoCallback]);
};

export const useIsWebappSelect = () => {
  const location = useLocation();

  return useMemo(() => {
    return !!new URLSearchParams(location.search).get("subscribe");
  }, [location.search]);
};
