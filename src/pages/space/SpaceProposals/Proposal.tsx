import { Chip, Avatar, Typography } from "@mui/material";
import { useDaoId } from "hooks";
import { useRef, useEffect, useState } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import {  DaoProposal, ProposalStatus } from "types";
import {
  getProposalStatus,
  makeElipsisAddress,
  timeLeft,
  nFormatter,
} from "utils";
import {
  StyledProposal,
  StyledProposalContent,
  StyledProposalOwner,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
} from "./styles";

const getColor = (status: ProposalStatus) => {
  switch (status) {
    case "finished":
      return "primary";
    case "in-progress":
      return "primary";

    default:
      break;
  }
};

const ProposalContent = ({
  proposal,
  setHeight,
}: {
  proposal: DaoProposal;
  setHeight: (value: number) => void;
}) => {
  const ref = useRef<any>();
  const { text, status } = getProposalStatus(
    proposal.startDate,
    proposal.endDate
  );
  useEffect(() => {
    setHeight(ref.current.clientHeight);
  }, []);

  return (
    <StyledProposalContent ref={ref} className="container">
      <StyledFlexRow justifyContent="space-between">
        <Typography className="title">{proposal.title}</Typography>
        <Chip label={text} className="status" color={getColor(status)} />
      </StyledFlexRow>
      <StyledFlexColumn alignItems="flex-start">
        <StyledProposalOwner>
          <Avatar
            src={proposal.ownerAvatar}
            style={{ width: 30, height: 30 }}
          />
          <Typography>
            {makeElipsisAddress(proposal.ownerAddress, 8)}
          </Typography>
        </StyledProposalOwner>
        <Typography
          className="description"
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {proposal.description}
        </Typography>
        <EndTime proposal={proposal} status={status} />
        <Results status={status} />
      </StyledFlexColumn>
    </StyledProposalContent>
  );
};

const EndTime = ({
  proposal,
  status,
}: {
  proposal: DaoProposal;
  status: ProposalStatus;
}) => {
  if (status === "finished") return null;
  return (
    <Typography className="time-left">{timeLeft(proposal.endDate)}</Typography>
  );
};

export const ProposalComponent = ({ proposal }: { proposal: DaoProposal }) => {
  const { proposalPage } = useAppNavigation();
  const daoId = useDaoId();
  const [height, setHeight] = useState(0);
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = !height ? true : entry && entry.isIntersecting;

  return (
    <StyledProposal
      style={{ height: height || "auto" }}
      onClick={() => proposalPage.root(daoId, proposal.id)}
      ref={ref}
    >
      {isVisible && (
        <ProposalContent setHeight={setHeight} proposal={proposal} />
      )}
    </StyledProposal>
  );
};

const Results = ({ status }: { status: ProposalStatus }) => {
  if (status === "in-progress") return null;
  return (
    <StyledFlexColumn gap={5}>
      <Result title="Yes" percent={10} tonAmount={20000} />
      <Result title="No" percent={30} tonAmount={20000} />
      <Result title="Abstain" percent={60} tonAmount={20000} />
    </StyledFlexColumn>
  );
};

const Result = ({
  title,
  percent,
  tonAmount,
}: {
  title: string;
  percent: number;
  tonAmount: number;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <Typography style={{ fontWeight: 700 }}>{title}</Typography>
          <Typography fontSize={13}>{nFormatter(tonAmount, 2)} TON</Typography>
        </StyledFlexRow>
        <Typography style={{ fontWeight: 700 }}>{percent}%</Typography>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};
