import { Header, LoadingContainer } from "components";
import { useIsOwner, useMobile } from "hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoFromQueryParam } from "query/getters";
import { StyledFlexColumn } from "styles";
import { MetadataForm } from "./Metadata";
import { RolesForm } from "./Roles";
import { SetFwdMsgFee } from "./SetFwdMsgFee";

export function DaoSettings() {
  const translations = useDaoPageTranslations();
  const { isLoading, data } = useDaoFromQueryParam();

  const { isDaoOwner } = useIsOwner(data?.daoAddress);
  const mobile = useMobile();

  return (
    <StyledFlexColumn>
      {!mobile && <Header title={translations.settings} />}
      {isLoading ? (
        <LoadingContainer loaderAmount={5} />
      ) : (
        <>
          <SetFwdMsgFee />
          {isDaoOwner && (
            <>
              <RolesForm />
              <MetadataForm />
            </>
          )}
        </>
      )}
    </StyledFlexColumn>
  );
}
