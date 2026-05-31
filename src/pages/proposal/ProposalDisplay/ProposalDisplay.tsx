import { IconButton, styled, useMediaQuery } from "@mui/material";
import { AppTooltip, ErrorContainer } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Deadline } from "./Deadline";
import { Metadata } from "./Metadata";
import { Results } from "./Results";
import { Vote } from "./Vote";
import { Votes } from "./Votes";
import { appNavigation } from "router/navigation";
import {
  useAppParams,
  useAppQueryParams,
  useProposalStatus,
  useRole,
} from "hooks/hooks";
import { Dao, ProposalStatus } from "types";
import { ProposalAbout } from "./ProposalAbout";
import { useEffect, useState } from "react";
import { Page } from "wrappers";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { useDaoQuery, useProposalQuery } from "query/getters";
import { EditProposalModal } from "../EditProposalModal";
import { getProposalStatus } from "utils";

const gap = 15;

const useComponents = () => {
  const { proposalAddress } = useAppParams();
  const isLoading = useProposalQuery(proposalAddress).isLoading;

  const { proposalStatus } = useProposalStatus(proposalAddress);

  return {
    votes:
      !proposalStatus ||
      proposalStatus === ProposalStatus.NOT_STARTED ? null : (
        <Votes />
      ),
    vote:
      !proposalStatus ||
      proposalStatus !== ProposalStatus.ACTIVE ||
      isLoading ? null : (
        <Vote />
      ),
    deadline:
      !proposalStatus || proposalStatus === ProposalStatus.CLOSED ? null : (
        <Deadline />
      ),
    results:
      !proposalStatus ||
      proposalStatus === ProposalStatus.NOT_STARTED ? null : (
        <Results />
      ),
  };
};

const Destop = ({ dao }: { dao?: Dao }) => {
  const {  votes, vote, deadline, results } =
    useComponents();

  return (
    <StyledWrapper>
      <StyledLeft>
        <ProposalAbout dao={dao} />
        {vote}
        {votes}
      </StyledLeft>
      <StyledRight>
        {deadline}
       <Metadata />
        {results}
      </StyledRight>
    </StyledWrapper>
  );
};

const Mobile = ({ dao }: { dao?: Dao }) => {
  const { votes, vote, deadline, results } =
    useComponents();

  return (
    <StyledWrapper>
      {deadline}
      <ProposalAbout dao={dao} />
      {vote}
      {results}
      <Metadata />
      {votes}
    </StyledWrapper>
  );
};

export function ProposalDisplay() {
  const mobile = useMediaQuery("(max-width:800px)");
  const [showError, setShowError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { daoAddress, proposalAddress } = useAppParams();
  const { data: daoData } = useDaoQuery(daoAddress);
  const dao = daoData || undefined;

  const error = useProposalQuery(proposalAddress).error;
  

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const errorContainer =  showError;

  return (
    <Page
      back={appNavigation.daoPage.root(daoAddress)}
      headerComponent={
        <EditButton dao={dao} onClick={() => setEditOpen(true)} />
      }
    >
      {errorContainer ? (
        <ErrorContainer text="Proposal not found" />
      ) : mobile ? (
        <Mobile dao={dao} />
      ) : (
        <Destop dao={dao} />
      )}
      <EditProposalModal
        dao={dao}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </Page>
  );
}

export default ProposalDisplay;

const EditButton = ({ dao, onClick }: { dao?: Dao; onClick: () => void }) => {
  const { proposalAddress } = useAppParams();

  const {
    query: { dev },
  } = useAppQueryParams();
  const { data: proposal, isLoading } = useProposalQuery(proposalAddress);
  const { proposalStatus: tickingProposalStatus } =
    useProposalStatus(proposalAddress);
  const proposalStatus = proposal?.metadata
    ? getProposalStatus(proposal.metadata)
    : tickingProposalStatus;

  const { isOwner, isProposalPublisher } = useRole(dao?.daoRoles);

  if (isLoading) return null;
  if (dev !== "true") return null;
  if (!isOwner && !isProposalPublisher) return null;
  if (!proposalStatus) return null;
  if (proposalStatus !== ProposalStatus.NOT_STARTED) return null;

  return (
    <AppTooltip text="Edit">
      <StyledEditButton onClick={onClick}>
        <MdOutlineModeEditOutline
          style={{ width: 20, height: 20, color: "white" }}
        />
      </StyledEditButton>
    </AppTooltip>
  );
};

const StyledEditButton = styled(IconButton)({
  padding: 0,
  width: 35,
  height: 35,
  borderRadius: "50%",
  background: "#0088CC",
  cursor: "pointer",
});

const StyledWrapper = styled(StyledFlexRow)({
  gap,
  alignItems: "flex-start",
  "@media (max-width: 850px)": {
    flexDirection: "column",
  },
});

const StyledLeft = styled(StyledFlexColumn)({
  width: "calc(100% - 370px - 10px)",
  gap,
});

const StyledRight = styled(StyledFlexColumn)({
  width: 370,
  gap,
});
