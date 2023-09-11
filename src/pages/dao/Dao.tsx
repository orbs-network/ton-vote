import { APP_NAME } from "config";
import { useAppParams } from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoQuery } from "query/getters";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { useAppNavigation } from "router/navigation";
import { parseLanguage } from "utils";
import { Webapp } from "WebApp";
import { Page } from "wrappers";
import { DaoLayout } from "./components";


export function Dao() {
  const { daoAddress } = useAppParams();
  const { data, isError } = useDaoQuery(daoAddress);
  const translations = useDaoPageTranslations();
  const { daosPage } = useAppNavigation();

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
      <Page>
        <Webapp.BackBtn onClick={daosPage.root} />
        {isError ? (
          <Page.Error text={translations.spaceNotFound} />
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
