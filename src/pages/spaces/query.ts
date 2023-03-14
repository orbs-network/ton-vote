import { useInfiniteQuery } from "@tanstack/react-query";
import { delay } from "@ton-defi.org/ton-connection";
import _ from "lodash";
import { Space } from "types";
import { createSpace } from "utils";

const createSpaces = (amount: number): Space[] => {
  return _.range(0, amount).map((it, i) => {
    return createSpace(i);
  });
};

const data = _.range(0, 100).map((it, i) => {
  return createSpaces(i * 10);
});
const getSpaces = async ({ pageParam = 1 }) => {
  await delay(1500);
  return {
    nextPage: pageParam + 1,
    spaces: data[pageParam],
  };
};

export const useGetSpacesQuery = () => {
  return useInfiniteQuery({
    queryKey: ["useGetSpacesQuery"],
    queryFn: getSpaces,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
