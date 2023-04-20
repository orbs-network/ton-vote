import { APP_TITLE } from "config";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";

export function DaoPage() {
  const dapAddress = useDaoAddress();
  const dao = useDaoQuery(dapAddress).data;

  return (
    <>
      <Helmet>
        <title>
          {APP_TITLE}
          {dao ? ` - ${dao.daoMetadata.name}` : ""}
        </title>
      </Helmet>
      <Outlet />
    </>
  );
}
