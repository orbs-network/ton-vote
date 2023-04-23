import { StringParam, useQueryParam } from "use-query-params";

export const useFilterValueByState = () => {
  return useQueryParam("state", StringParam);
};
export const useFilterValueByText = () => {
  return useQueryParam("q", StringParam);
};
