import _ from "lodash";
import { Dao } from "types";

 const data: Dao[] = [
  {
    daoAddress: "EQCh4ksBLF4bHmqPqzZT9AlnKgh49luRGqhpVdm3dZ0m1XTN",
    daoId: 5,
    daoMetadata: {
      about: '{"en":"This is a mock dao 1"}',
      avatar: "https://tonv.s3.us-east-2.amazonaws.com/stonfi.png",
      github: "",
      hide: false,
      name: '{"en":"Mock Dao"}',
      terms: "",
      telegram: "",
      website: "",
      jetton: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
      nft: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    },
    daoRoles: {
      owner: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
      proposalOwner: "EQDehfd8rzzlqsQlVNPf9_svoBcWJ3eRbz-eqgswjNEKRIwo",
    },
    daoProposals: [],
  },
];



export  const daos = _.map(data, (dao, index) => {
    return {
      ...dao,
      daoAddress: `${dao.daoAddress}-mock-${index}`,
    };
});