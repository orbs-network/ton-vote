import { Helmet } from "react-helmet";
import { APP_NAME } from "config";
import { parseLanguage } from "utils";
import { Outlet } from "react-router-dom";
import { useProposalQuery } from "query/getters";
import { useAppParams } from "hooks";


const Meta = () => {
  const {proposalAddress} = useAppParams()
  const title = useProposalQuery(proposalAddress).data?.metadata?.title;

  return (
    <Helmet>
      <title>
        {APP_NAME}
        {title ? ` - ${parseLanguage(title)}` : ""}
      </title>
    </Helmet>
  );
};

export function Proposal() {
  return (
    <>
      <Meta />
      <Outlet />
    </>
  );
}

export default Proposal;

