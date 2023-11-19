import { LATEST_FOUNDATION_PROPOSAL_ADDRESS } from "../data";
import { LATEST_TF_PROPOSAL_DESCRIPTION } from "../description";
import { THE_OPEN_LEAGUE_DESCRIPTION } from "./the-open-league";

const hardocded = {
  "EQA5eyWDAAegbL5Ay1CfelGG3yY9Ow7bgpfocTV6KDt9zeIl": THE_OPEN_LEAGUE_DESCRIPTION,
  [LATEST_FOUNDATION_PROPOSAL_ADDRESS]: LATEST_TF_PROPOSAL_DESCRIPTION,
};



export const getProposalDescription = (address: string, decription?: string) => {
  return hardocded[address as keyof typeof hardocded] || decription;
};
