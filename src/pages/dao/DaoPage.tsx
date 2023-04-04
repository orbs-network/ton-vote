import { Page } from "components";
import { APP_TITLE } from "config";
import { useDaoAddress } from "hooks";
import { useDaoMetadataQuery } from "query/queries";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { appNavigation } from "router";
import { useCurrentRoute } from "hooks";
import { useMemo } from "react";

export function DaoPage() {
  const dapAddress = useDaoAddress();
  const daoMetadata = useDaoMetadataQuery(dapAddress).data;
  const currentRoute = useCurrentRoute();

  const back = useMemo(() => {
    if (currentRoute && currentRoute!.indexOf("create") > -1) {
      return;
    }
    return appNavigation.spaces;
  }, [currentRoute]);

  return (
    <Page back={back}>
      <Helmet>
        <title>
          {APP_TITLE}
          {daoMetadata ? ` - ${daoMetadata.name}` : ""}
        </title>
      </Helmet>
      <Outlet />
    </Page>
  );
}
