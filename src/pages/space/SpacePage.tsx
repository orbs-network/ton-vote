import { Page } from "components";
import { APP_TITLE } from "config";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { useDaoQuery } from "./hooks";

function SpacePage() {
  const dao = useDaoQuery().data;
  return (
    <Page>
      <Helmet>
        <title>
          {APP_TITLE}
          {dao ? ` - ${dao.name}` : ""}
        </title>
      </Helmet>
      <Outlet />
    </Page>
  );
}

export { SpacePage };
