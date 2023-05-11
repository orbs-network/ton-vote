import { Header, LoadingContainer } from "components";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoFromQueryParam } from "query/getters";
import { StyledFlexColumn } from "styles";
import { MetadataForm } from "./Metadata";
import { RolesForm } from "./Roles";
import { SetFwdMsgFee } from "./SetFwdMsgFee";

export function DaoSettings() {
  const translations = useDaoPageTranslations();
  const {isLoading} = useDaoFromQueryParam()


    return (
      <StyledFlexColumn>
        <Header title={translations.settings} />
        {isLoading ? (
          <LoadingContainer loaderAmount={5} />
        ) : (
          <>
          <SetFwdMsgFee />
            <RolesForm />
            <MetadataForm />
          </>
        )}
      </StyledFlexColumn>
    );
}
