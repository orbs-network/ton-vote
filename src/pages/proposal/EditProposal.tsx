import { styled, Typography } from "@mui/material";
import { Header, LoadingContainer } from "components";
import { ProposalForm } from "forms/proposal-form/ProposalForm";
import { prepareMetadata } from "forms/proposal-form/utils";
import { useProposalAddress, useProposalStatus } from "hooks";
import { useDaoFromQueryParam } from "query/getters";
import { useUpdateProposalMutation } from "query/setters";
import React, { ReactNode } from "react";
import { appNavigation } from "router/navigation";
import { StyledContainer, StyledFlexColumn } from "styles";
import { ProposalMetadata } from "ton-vote-contracts-sdk";
import { ProposalForm as ProposalFormType, ProposalStatus } from "types";
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

export function EditProposal() {
  const { data: dao } = useDaoFromQueryParam();
  const proposalAddress = useProposalAddress();
  const { data: proposal } = useProposalPageQuery();
  const { proposalStatus } = useProposalStatus(
    proposalAddress,
    proposal?.metadata
  );

  const { mutate, isLoading } = useUpdateProposalMutation();

  const update = (values: ProposalFormType) => {
    const data = prepareMetadata(values);
    mutate({
      title: data.title!,
      description: data.description!,
      proposalAddr: proposalAddress,
      daoAddress: dao!.daoAddress,
    });
  };

  if (!proposal || !dao) {
    return (
      <Container>
        <LoadingContainer loaderAmount={5} />
      </Container>
    );
  }

  if (proposalStatus === ProposalStatus.CLOSED) {
    return (
      <Container>
        <StyledWarning>
          <StyledWarningFlex>
            <Typography>Closed proposal cant be updated</Typography>
          </StyledWarningFlex>
        </StyledWarning>
      </Container>
    );
  }

  return (
    <Container>
      <ProposalForm
        submitText="Update"
        initialFormData={parseMetadata(proposal?.metadata)}
        onSubmit={update}
        isLoading={isLoading}
        dao={dao!}
        editMode={true}
      />
    </Container>
  );
}

const StyledWarning = styled(StyledContainer)({
  width: "100%",
  p: {
    fontSize: 18,
    fontWeight: 600,
  },
});

const StyledWarningFlex = styled(StyledFlexColumn)({
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 100,
});

const Container = ({ children }: { children: ReactNode }) => {
  const { data: dao } = useDaoFromQueryParam();
  const proposalAddress = useProposalAddress();

  const back = () => {
    if (!dao) return "";
    return appNavigation.proposalPage.root(dao.daoAddress, proposalAddress);
  };

  return (
    <Page back={back()}>
      <StyledContent>
        <StyledHeader title="Edit proposal" />
        {children}
      </StyledContent>
    </Page>
  );
};

const StyledHeader = styled(Header)({
  marginTop: 10,
});

const StyledContent = styled(StyledFlexColumn)({
  justifyContent: "center",
});

export default EditProposal;
