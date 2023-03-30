import { Page } from "components";
import { APP_TITLE } from "config";
import { useDaoAddress } from "hooks";
import { useDaoMetadataQuery, useDaoRolesQuery } from "query/queries";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";

export function DaoPage() {
  const dapAddress = useDaoAddress()
  const daoMetadata = useDaoMetadataQuery(dapAddress).data;
  const rules = useDaoRolesQuery(dapAddress).data;

  
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

