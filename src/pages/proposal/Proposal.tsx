import { Helmet } from "react-helmet";
import { APP_NAME } from "config";
import { useProposalPageQuery } from "./hooks";
import { parseLanguage } from "utils";
import { Outlet } from "react-router-dom";

const gap = 15;


const Meta = () => {
  const title = useProposalPageQuery().data?.metadata?.title;

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

