import { Helmet } from "react-helmet";
import { APP_NAME } from "config";
import { parseLanguage } from "utils";
import { Navigate, Outlet } from "react-router-dom";
import { useProposalQuery } from "query/getters";
import { useAppParams } from "hooks/hooks";
import { appNavigation } from "router/navigation";

const PROPOSAL_REDIRECTS: Record<
  string,
  { daoAddress: string; proposalAddress: string }
> = {
  "EQALWRyOG5lnkQjqZ3I0XOEhshGVzo8BvzsdSYPYEsepN--x": {
    daoAddress: "EQDQvywF226NXojPky_9gwbCz0FPoygqY11bGl03SONNBs5V",
    proposalAddress:
      "EQAv-VS2OM80SYLB0ouRWRcpFg4J0L-egUf1-utF-OJ6h0rK",
  },
};


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
  const { proposalAddress } = useAppParams();
  const redirect = PROPOSAL_REDIRECTS[proposalAddress];

  if (redirect) {
    return (
      <Navigate
        replace
        to={appNavigation.proposalPage.root(
          redirect.daoAddress,
          redirect.proposalAddress
        )}
      />
    );
  }

  return (
    <>
      <Meta />
      <Outlet />
    </>
  );
}

export default Proposal;
