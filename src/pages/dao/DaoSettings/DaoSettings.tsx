import { useAppParams, useRole } from "hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import {useDaoQuery } from "query/getters";
import { LayoutSection } from "../components";
import { MetadataForm } from "./Metadata";
import { RolesForm } from "./Roles";
import { SetFwdMsgFee } from "./SetFwdMsgFee";

export function DaoSettings() {
  const translations = useDaoPageTranslations();
    const { daoAddress } = useAppParams();

  const { isLoading, data } = useDaoQuery(daoAddress);

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
