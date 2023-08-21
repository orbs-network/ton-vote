import { Typography } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { Container } from "components";
import { useAppParams, useRole } from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import {useDaoQuery, useRegistryStateQuery } from "query/getters";
import { LayoutSection } from "../components";
import { MetadataForm } from "./Metadata";
import { RolesForm } from "./Roles";
import { SetFwdMsgFee } from "./SetFwdMsgFee";
import { UpdateWizard } from "./UpdateWizard";

export function DaoSettings() {
  const translations = useDaoPageTranslations();
    const { daoAddress } = useAppParams();
    const address = useTonAddress()
  const { isLoading, data } = useDaoQuery(daoAddress);

  const { isOwner } = useRole(data?.daoRoles);

  const registryAdminAddress = useRegistryStateQuery().data?.registryAddr;
  
  return (
    <LayoutSection title={translations.settings} isLoading={isLoading}>
      <>
        {registryAdminAddress === address && <SetFwdMsgFee />}
        {isOwner && (
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
