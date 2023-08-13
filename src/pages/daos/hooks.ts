import { useAppQueryParams } from "hooks/hooks";
import _ from "lodash";
import { useDaosQuery } from "query/getters";
import { useMemo } from "react";
import { Dao } from "types";

export const useFilterDaos = () => {
  const { query, setSearch } = useAppQueryParams();
  const { data: daos = [], dataUpdatedAt } = useDaosQuery();

  const searchValue = query.search || "";

  const filteredDaos = useMemo(() => {
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
    ) as Dao[];
  }, [dataUpdatedAt, searchValue]);

  return {
    filteredDaos,
    searchValue,
    setSearch,
    initialSearch: query.search,
  };
};
