import { StyledFlexColumn, StyledFlexRow } from "styles";
import { StyledDaosAmount, StyledHeader, StyledSearch } from "./styles";
import { nFormatter } from "utils";
import _ from "lodash";
import { useAppQueryParams, useCurrentRoute, useMobile } from "hooks/hooks";
import { useDaosPageTranslations } from "i18n/hooks/useDaosPageTranslations";
import { useDaosQuery } from "query/getters";
import { Page } from "wrappers";
import { TWAMenu } from "./TWAMenu";
import { DaosList } from "./components/DaosList";
import { routes } from "consts";
import { useAppNavigation } from "router/navigation";
import { Dao } from "types";
import { Webapp } from "WebApp";

export function DaosPage() {
  const { data = [] } = useDaosQuery();
  const mobile = useMobile();
  const { query, setSearch } = useAppQueryParams();
  const { daoPage } = useAppNavigation();

  const route = useCurrentRoute();

  const isWebappSelect = route === routes.webappSpaces;

  const onDaoSelect = (dao: Dao) => {
    if (isWebappSelect) {
      Webapp.onDaoSelect(dao);
    } else {
      daoPage.root(dao.daoAddress);
    }
  };

  const onSearchInputChange = (value: string) => {
    setSearch(value);
  };
  const translations = useDaosPageTranslations();

  return (
    <Page hideBack={true}>
      <StyledFlexColumn alignItems="flex-start" gap={mobile ? 10 : 24}>
        <StyledHeader>
          <StyledFlexRow style={{ flex: 1, justifyContent: "flex-start" }}>
            <TWAMenu />
            <StyledSearch
              initialValue={query.search || ""}
              onChange={onSearchInputChange}
              placeholder={translations.searchForDAO}
            />
          </StyledFlexRow>
          <StyledDaosAmount>
            {nFormatter(_.size(data))} {translations.spaces}
          </StyledDaosAmount>
        </StyledHeader>
        <DaosList onSelect={onDaoSelect} showNewDao={!isWebappSelect} />
      </StyledFlexColumn>
    </Page>
  );
}

export default DaosPage;
