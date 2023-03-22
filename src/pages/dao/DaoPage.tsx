import { Page } from "components";
import { APP_TITLE } from "config";
import { useDaoAddress } from "hooks";
import { useDaoMetadataQuery } from "query";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";

export function DaoPage() {
  const dapAddress = useDaoAddress()
  const daoMetadata = useDaoMetadataQuery(dapAddress).data;
  return (
    <Page>
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

