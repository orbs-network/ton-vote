import { ErrorContainer } from "components";
import { APP_NAME } from "config";
import { useAppParams } from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoQuery } from "query/getters";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { appNavigation } from "router/navigation";
import { parseLanguage } from "utils";
import { Page } from "wrappers";
import { DaoLayout } from "./components";


export function Dao() {
  const {daoAddress} = useAppParams();
  const { data, isError } = useDaoQuery(daoAddress);
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
      <Page back={appNavigation.spaces}>
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