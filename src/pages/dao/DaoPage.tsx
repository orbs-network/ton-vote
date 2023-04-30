import { ErrorContainer } from "components";
import { APP_NAME } from "config";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { parseLanguage } from "utils";

export function DaoPage() {
  const dapAddress = useDaoAddress();
  const { data, error } = useDaoQuery(dapAddress);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  return (
    <>
      <Helmet>
        <title>
          {APP_NAME}
          {data ? ` - ${parseLanguage(data.daoMetadata.name)}` : ""}
        </title>
      </Helmet>
      {showError ? <ErrorContainer text="Space not found" /> : <Outlet />}
    </>
  );
}
