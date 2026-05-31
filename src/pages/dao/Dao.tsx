import { ErrorContainer, PageLoader } from "components";
import { APP_NAME } from "config";
import { useAppParams } from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoQuery } from "query/getters";
import { Suspense } from "react";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { parseLanguage } from "utils";
import { Page } from "wrappers";
import { DaoLayout } from "./components";


export function Dao() {
  const { daoAddress } = useAppParams();
  const { data, isError, isFetching, isInitialLoading } =
    useDaoQuery(daoAddress);
  const translations = useDaoPageTranslations();
  const isDaoLoading = isInitialLoading || (isFetching && !data);
  const isDaoNotFound = isError || (!isDaoLoading && !data);

  return (
    <>
      <Helmet>
        <title>
          {APP_NAME}
          {data
            ? ` - ${parseLanguage(data.daoMetadata.metadataArgs.name)}`
            : ""}
        </title>
      </Helmet>
      <Page hideBack={true}>
        {isDaoLoading ? (
          <PageLoader />
        ) : isDaoNotFound ? (
          <ErrorContainer text={translations.spaceNotFound} />
        ) : (
          <DaoLayout>
            <Outlet />
          </DaoLayout>
        )}
      </Page>
    </>
  );
}

export default Dao;
