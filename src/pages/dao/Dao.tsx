import { ErrorContainer } from "components";
import { APP_NAME } from "config";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoFromQueryParam } from "query/getters";
import { Suspense } from "react";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { parseLanguage } from "utils";
import { Page } from "wrappers";
import { DaoLayout } from "./components";


export function Dao() {
  const { data, isError } = useDaoFromQueryParam();
  const translations = useDaoPageTranslations();

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
        {isError ? (
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