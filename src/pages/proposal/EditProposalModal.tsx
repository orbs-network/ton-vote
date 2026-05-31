import { styled, Typography } from "@mui/material";
import { LoadingContainer, Popup } from "components";
import { ProposalForm } from "forms/proposal-form/ProposalForm";
import { prepareMetadata } from "forms/proposal-form/utils";
import { useAppParams, useProposalStatus } from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { useUpdateProposalMutation } from "query/setters";
import { StyledContainer, StyledFlexColumn } from "styles";
import { ProposalMetadata } from "ton-vote-contracts-sdk";
import { Dao, ProposalForm as ProposalFormType, ProposalStatus } from "types";
import { getProposalStatus } from "utils";
import { parseProposalMetadataForm } from "./editProposalUtils";

interface Props {
  dao?: Dao;
  open: boolean;
  onClose: () => void;
}

export function EditProposalModal({ dao, open, onClose }: Props) {
  const { proposalAddress } = useAppParams();
  const { data: proposal } = useProposalQuery(proposalAddress);
  const { proposalStatus: tickingProposalStatus } =
    useProposalStatus(proposalAddress);
  const proposalStatus = proposal?.metadata
    ? getProposalStatus(proposal.metadata)
    : tickingProposalStatus;
  const { mutate, isLoading } = useUpdateProposalMutation({
    onSuccess: onClose,
  });

  const update = (values: ProposalFormType) => {
    const metadata = prepareMetadata(values) as ProposalMetadata;

    mutate(metadata);
  };

  return (
    <StyledPopup
      open={open}
      onClose={isLoading ? undefined : onClose}
      title="Edit proposal"
    >
      {!proposal || !dao ? (
        <LoadingContainer loaderAmount={5} />
      ) : !proposalStatus || proposalStatus !== ProposalStatus.NOT_STARTED ? (
        <StyledWarning>
          <StyledWarningFlex>
            <Typography>Only pending proposals can be edited</Typography>
          </StyledWarningFlex>
        </StyledWarning>
      ) : (
        <ProposalForm
          submitText="Update"
          initialFormData={parseProposalMetadataForm(proposal.metadata)}
          onSubmit={update}
          isLoading={isLoading}
          dao={dao}
          editMode={true}
          status={proposalStatus || undefined}
        />
      )}
    </StyledPopup>
  );
}

const StyledPopup = styled(Popup)({
  width: "min(960px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 32px)",
  overflow: "auto",
  ".title-container-children": {
    padding: 20,
  },
  ".formik-form": {
    boxShadow: "none",
  },
});

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
