import { StyledFlexColumn, StyledFlexRow } from "styles";
import { StyledDaosAmount, StyledHeader, StyledSearch } from "./styles";
import { nFormatter } from "utils";
import _ from "lodash";
import { useAppQueryParams, useMobile } from "hooks/hooks";
import { useDaosPageTranslations } from "i18n/hooks/useDaosPageTranslations";
import { useDaosQuery } from "query/getters";
import { Page } from "wrappers";
import { TWAMenu } from "./TWAMenu";
import { styled } from "@mui/material";
import { DaosList } from "./components/DaosList/DaosList";


export function DaosPage() {
  const { data } = useDaosQuery();
  const mobile = useMobile();
  const { query, setSearch } = useAppQueryParams();

  const onSearchInputChange = (value: string) => {
    setSearch(value);
  };
  const translations = useDaosPageTranslations();

  return (
    <Page>
      <StyledContainer gap={mobile ? 10 : 24}>
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
        <DaosList />
      </StyledContainer>
    </Page>
  );
}

const StyledContainer = styled(StyledFlexColumn)({
  flex:1,
  alignItems:'flex-start',
  justifyContent:'flex-start'
})

export default DaosPage;
