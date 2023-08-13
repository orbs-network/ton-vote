import _ from "lodash";
import { useMobile } from "hooks/hooks";
import { useDaosPageTranslations } from "i18n/hooks/useDaosPageTranslations";
import { useDaosQuery } from "query/getters";
import { styled, Typography } from "@mui/material";
import { useFilterDaos } from "../hooks";
import {
  IonButton,
  IonApp,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonProgressBar,
} from "@ionic/react";
import { Page } from "wrappers";
import { close, closeCircle, pin } from "ionicons/icons";
import {
  IonContent,
  IonAvatar,
  IonLabel,
  IonList,
  IonItem,
  IonPage,
  IonSearchbar,
  IonNavLink,
} from "@ionic/react";
import { makeElipsisAddress, parseLanguage } from "utils";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useAppNavigation } from "router/navigation";
import { Dao } from "pages/dao/twa/Dao";

export function DaosPage() {
  const { isLoading } = useDaosQuery();

  const { filteredDaos, setSearch } = useFilterDaos();

  const onSearchInputChange = (value: string) => {
    setSearch(value);
  };
  const translations = useDaosPageTranslations();
  const { daoPage } = useAppNavigation();

  const emptyList = !isLoading && !_.size(filteredDaos);

  return (
    <>
      <IonHeader hidden={true}>
        <IonToolbar>
          <IonTitle>Daos</IonTitle>
        </IonToolbar>
        <IonToolbar>
          {isLoading && <IonProgressBar type="indeterminate"></IonProgressBar>}

          <IonSearchbar
            debounce={300}
            placeholder="Search Dao"
            onIonInput={(e) => {
              setSearch(e.target.value || "");
            }}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          {filteredDaos.map((dao, index) => (
            <StyledItem key={dao.daoAddress}>
              <StyledLink
                routerDirection="forward"
                component={() => <Dao address={dao.daoAddress} />}
              >
                <StyledFlexRow>
                  <IonAvatar slot="start">
                    <img
                      src={dao.daoMetadata.metadataArgs.avatar}
                      alt="avatar"
                    />
                  </IonAvatar>
                  <StyledLabels>
                    <IonLabel>
                      {parseLanguage(dao.daoMetadata.metadataArgs.name)}
                    </IonLabel>
                    <IonLabel>{makeElipsisAddress(dao.daoAddress)}</IonLabel>
                  </StyledLabels>
                </StyledFlexRow>
              </StyledLink>
            </StyledItem>
          ))}
        </IonList>
      </IonContent>
    </>
  );
}

const StyledLink = styled(IonNavLink)({
  width:'100%',
  height:'100%'
})

const StyledItem = styled(IonItem)({});

const StyledLabels = styled(StyledFlexColumn)({
  flex:1,
  paddingTop: 10,
  paddingBottom: 10,
  gap: 5,
  alignItems: "flex-start",
});

export default DaosPage;
