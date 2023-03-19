import _ from "lodash";
import moment from "moment";
import { Dao, DaoProposal } from "types";

export const createDaos = (amount: number): Dao[] => {
  return _.range(0, amount).map((it, i) => {
    return createSpace(i);
  });
};

export const createSpace = (i: number) => {
  return {
    name: `spaces ${i++}`,
    image: `https://picsum.photos/id/${i}/200/200`,
    members: i * 50,
    id: `spaces-${i++}`,
  };
};

export const createProposals = (amount: number): DaoProposal[] => {
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
