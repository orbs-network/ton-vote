import { Header, LoadingContainer } from "components";
import { useMobile, useRole } from "hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoFromQueryParam } from "query/getters";
import { LayoutSection } from "../components";
import { MetadataForm } from "./Metadata";
import { RolesForm } from "./Roles";
import { SetFwdMsgFee } from "./SetFwdMsgFee";

export function DaoSettings() {
  const translations = useDaoPageTranslations();
  const { isLoading, data } = useDaoFromQueryParam();

  const { isOwner, isProposalPublisher } = useRole(data?.daoRoles);

  const showAll = isOwner || isProposalPublisher;

  return (
    <LayoutSection title={translations.settings} isLoading={isLoading}>
      <>
        <SetFwdMsgFee />
        {showAll && (
          <>
            <RolesForm />
            <MetadataForm />
          </>
        )}
      </>
    </LayoutSection>
  );
}

export default DaoSettings;
