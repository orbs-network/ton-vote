import { useAppParams, useProposalStatus } from "hooks/hooks";
import { useDaoQuery, useProposalQuery } from "query/getters";
import React from "react";
import {
  IonContent,
  IonAvatar,
  IonLabel,
  IonList,
  IonItem,
  IonPage,
  IonSearchbar,
  IonText,
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonSkeletonText,
  IonChip,
  IonIcon,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import removeMd from "remove-markdown";
import {
  home,
  heart,
  pin,
  star,
  call,
  globe,
  basket,
  barbell,
  trash,
  person,
} from "ionicons/icons";

import { makeElipsisAddress, parseLanguage } from "utils";
import { StyledFlexColumn, StyledFlexRow, StyledIonPage } from "styles";
import { styled, Typography } from "@mui/material";
import { VerifiedDao } from "components";
import { useAppNavigation } from "router/navigation";
import { useNavigationLinks, useProposalTimeline } from "../hooks";
import { IoText } from "react-icons/io5";
export function Dao({ address }: { address?: string }) {
  const { daoAddress } = useAppParams();
  const { data, isError } = useDaoQuery(address || daoAddress);
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <StyledFlexRow justifyContent="flex-start">
            <IonButtons slot="">
              <IonBackButton></IonBackButton>
            </IonButtons>
            <Typography>
              {parseLanguage(data?.daoMetadata.metadataArgs.name)}
            </Typography>
          </StyledFlexRow>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <DaoDetails address={address} />
        <IonList>
          {data?.daoProposals.map((it) => (
            <Proposal key={it} address={it} />
          ))}
        </IonList>
        <Menu daoAddress={daoAddress} />
      </IonContent>
    </>
  );
}


const Menu = ({ daoAddress }: { daoAddress: string }) => {
  const navigations = useNavigationLinks(daoAddress);
  console.log(navigations);

  return (
    <IonSegment scrollable={true} value="heart">
      {navigations?.map((it) => {
        return (
          <IonSegmentButton value="home" key={it.path}>
            <IoText>{it.title}</IoText>
          </IonSegmentButton>
        );
      })}
    </IonSegment>
  );
};

const DaoDetails = ({ address }: { address?: string }) => {
  const { data: dao, isError } = useDaoQuery(address || "");

  return (
    <StyledCard>
      <IonAvatar>
        <img src={dao?.daoMetadata.metadataArgs.avatar} alt="avatar" />
      </IonAvatar>
      <StyledFlexRow justifyContent="flex-start">
        <IonLabel>{parseLanguage(dao?.daoMetadata.metadataArgs.name)}</IonLabel>
        <VerifiedDao daoAddress={address} />
      </StyledFlexRow>
      <IonLabel>{makeElipsisAddress(address)}</IonLabel>
    </StyledCard>
  );
};

const StyledCard = styled(IonCard)({
  padding: 10,
});

const Proposal = ({ address }: { address: string }) => {
  const { data: proposal, isLoading } = useProposalQuery(address);
  const { proposalPage } = useAppNavigation();
    const timeline = useProposalTimeline(address);
    const {proposalStatusText} = useProposalStatus(address)

  return (
    <IonItem onClick={() => proposalPage.root(proposal?.daoAddress!, address)}>
      <StyledFlexColumn alignItems="flex-start">
        <StyledFlexRow justifyContent='space-between'>
          <IonLabel>{makeElipsisAddress(address)}</IonLabel>
          <IonChip color="primary">{proposalStatusText}</IonChip>
        </StyledFlexRow>
        <IonLabel>{parseLanguage(proposal?.metadata?.title)}</IonLabel>
        <IonText>
          {removeMd(parseLanguage(proposal?.metadata?.description) || "", {
            useImgAltText: true,
          })}
        </IonText>
        <IonText>{timeline}</IonText>
      </StyledFlexColumn>
    </IonItem>
  );
};
