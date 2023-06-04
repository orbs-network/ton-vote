import { styled } from "@mui/material";
import { LoadingContainer } from "components";
import { ProposalForm } from "forms/proposal-form/ProposalForm";
import { useProposalAddress, useRole } from "hooks";
import { useDaoFromQueryParam } from "query/getters";
import React from "react";
import { appNavigation } from "router/navigation";
import { StyledFlexColumn } from "styles";
import { ProposalMetadata } from "ton-vote-contracts-sdk";
import { ProposalForm as ProposalFormType } from "types";
import { Page } from "wrappers";
import { useProposalPageQuery } from "./hooks";

const parseMetadata = (metadata?: ProposalMetadata) => {
  if (!metadata) {
    return {} as ProposalFormType;
  }

  return {
    title_en: JSON.parse(metadata.title).en,
    description_en: JSON.parse(metadata.description).en,
    proposalStartTime: metadata.proposalStartTime * 1000,
    proposalEndTime: metadata.proposalEndTime * 1000,
    proposalSnapshotTime: metadata.proposalSnapshotTime * 1000,
    votingSystemType: metadata.votingSystem.votingSystemType,
    votingPowerStrategies: metadata.votingPowerStrategies,
  } as ProposalFormType;
};

function EditProposal() {
  const { data: dao } = useDaoFromQueryParam();
  const proposalAddress = useProposalAddress();

  const { data: proposal } = useProposalPageQuery(false, {staleTime: Infinity, refetchInterval: Infinity});

  const isLoading = !proposal || !dao;

  const back = () => {
    if (!dao) return "";
    return appNavigation.proposalPage.root(dao.daoAddress, proposalAddress);
  };

  return (
    <Page back={back()}>
      <StyledContent>
        {isLoading ? (
          <LoadingContainer loaderAmount={5} />
        ) : (
          <ProposalForm
            submitText="Update"
            initialFormData={parseMetadata(proposal?.metadata)}
            persistForm={() => {}}
            onSubmit={() => {}}
            isLoading={false}
            dao={dao!}
            editMode={true}
          />
        )}
      </StyledContent>
    </Page>
  );
}

const StyledContent = styled(StyledFlexColumn)({
  justifyContent: "center",
});

export default EditProposal;
