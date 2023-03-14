import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { delay } from "@ton-defi.org/ton-connection";
import _ from "lodash";
import moment from "moment";
import { useGetSpacesQuery } from "pages/spaces/query";
import { Proposal, Space } from "types";
import { createSpace } from "utils";
import { create } from "zustand";

interface StatePage {
  page: number;
}

const usePageStore = create<StatePage>((set, get) => ({
  page: 1,
}));

const increment = () =>
  usePageStore.setState((state) => ({ page: state.page + 1 }));

export const useGetSpaceQuery = (id?: string) => {
  return useQuery<Space>(["useGetSpaceQuery", id], () => {
    return createSpace(2);
  });
};

const createProposalPeview = (amount: number): Proposal[] => {
  return _.range(0, amount).map((it, i) => {
    function isEven(n: number) {
      return n % 2 == 0;
    }
    const startDate = isEven(i)
      ? moment().subtract(7, "days").unix().valueOf()
      : moment().subtract(3, "days").unix().valueOf();
    const endDate = isEven(i)
      ? moment().subtract(1, "days").unix().valueOf()
      : moment().add(5, "days").unix().valueOf();
    return {
      title: `Proposal ${i++}`,
      description: `GSR is operating as normal and remains focused on maintaining liquidity for our clients despite the market events of last year. As standard practice we proactively manage our exposures to all exchanges and reduce dynamically where necessary. GSR is well-positioned to navigate the high volatility and continues to actively deploy capital to maintain healthy liquidity in both private and listed linear and nonlinear products in the space.`,
      ownerAvatar: `https://picsum.photos/id/${i++}/200/200`,
      ownerAddress: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      contractAddress: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      startDate,
      endDate,
      id: crypto.randomUUID(),
    };
  });
};

const useGetProposals = () => {
  const { page } = usePageStore();

  return () => {
    increment();
    return {
      page,
      proposals: createProposalPeview(page * 10),
    };
  };
};

const data = _.range(0, 100).map((it, i) => {
  return createProposalPeview(i * 5);
});

const useGetData = () => {
  return async ({ pageParam = 1 }) => {
    await delay(1500)
    return {
      nextPage: pageParam + 1,
      proposals: data[pageParam],
    };
  };
};

export const useGetProposalsQuery = (spaceId?: string) => {
  const getProposals = useGetData();
  return useInfiniteQuery({
    queryKey: ["useGetProposalsQuery", spaceId],
    queryFn: getProposals,
    enabled: !!spaceId,
    getNextPageParam: (prevPage) => prevPage.nextPage,
  });
};
