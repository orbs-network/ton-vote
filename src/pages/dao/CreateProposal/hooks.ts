import { useDaoAddressFromQueryParam } from "hooks";
import _ from "lodash";
import { useDaoQuery } from "query/getters";
import { useMemo } from "react";
import { STRATEGIES } from "./strategies";
import { handleDefaults } from "./utils";


export const useStrategies = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  const { data, dataUpdatedAt } = useDaoQuery(daoAddress);

  return useMemo(() => {
    return _.mapValues(STRATEGIES, (strategy) => {
      return {
        ...strategy,
        args: _.map(strategy.args, (it) => handleDefaults(it, data)),
      };
    });
  }, [dataUpdatedAt]);
};

