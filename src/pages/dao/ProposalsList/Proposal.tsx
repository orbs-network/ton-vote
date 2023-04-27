import { Typography } from "@mui/material";
import { AddressDisplay, Status, AppTooltip } from "components";
import { useAppQueryParams, useDaoAddress } from "hooks";
import _ from "lodash";
import { useProposalQuery, useProposalStatusQuery } from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalMetadata, VotingPowerStrategy } from "ton-vote-contracts-sdk";
import { Proposal, ProposalStatus } from "types";
import {
  getTimeDiff,
  calculateTonAmount,
  normalizeResults,
  getSymbol,
  parseLanguage,
} from "utils";
import { ProposalLoader } from "../ProposalLoader";
import removeMd from "remove-markdown";

import {
  StyledAlert,
  StyledMarkdown,
  StyledProposal,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
  StyledProposalTitle,
} from "./styles";
import { useTranslation } from "react-i18next";

const Time = ({
  proposalMetadata,
  status,
}: {
  proposalMetadata: ProposalMetadata;
  status: ProposalStatus | null;
}) => {
  const { t } = useTranslation();
  if (!status) return null;

  if (status === ProposalStatus.NOT_STARTED) {
    return (
      <Typography className="time-left">
        {t("startIn", {
          value: getTimeDiff(proposalMetadata.proposalStartTime),
        })}
      </Typography>
    );
  }
  return (
    <Typography className="time-left">
      {t("endIn", { value: getTimeDiff(proposalMetadata.proposalEndTime) })}
    </Typography>
  );
};

const useHideProposal = (
  proposalAddress: string,
  proposal?: Proposal,
  status?: ProposalStatus | null
) => {
  const { query } = useAppQueryParams();

  const title = proposal?.metadata?.title.toLowerCase();
  const description = proposal?.metadata?.description.toLowerCase();

  const filters = [title, description, proposalAddress];

  if (query.proposalState && query.proposalState !== status) {
    return true;
  }

  if (
    query.search &&
    !filters.some((it) => {
      return it?.toLowerCase().includes(query.search!.toLowerCase());
    })
  ) {
    return true;
  }

  return false;
};

export const ProposalComponent = ({
  proposalAddress,
}: {
  proposalAddress: string;
}) => {
  const { proposalPage } = useAppNavigation();
  const daoAddress = useDaoAddress();

  const { data: proposal, isLoading } = useProposalQuery(proposalAddress);

  const status = useProposalStatusQuery(proposal?.metadata, proposalAddress);
  const hideProposal = useHideProposal(proposalAddress, proposal, status);

  const onClick = () => {
    if (proposal?.url) {
      window.open(proposal.url);
    } else {
      proposalPage.root(daoAddress, proposalAddress);
    }
  };

  if (isLoading) {
    return <ProposalLoader />;
  }

  if (hideProposal) {
    return null;
  }

  const description = parseLanguage(proposal?.metadata?.description, "en");
  return (
    <StyledProposal onClick={onClick}>
      <StyledFlexColumn alignItems="flex-start">
        <StyledFlexRow justifyContent="space-between">
          <AppTooltip text="Proposal address" placement="right">
            <AddressDisplay address={proposalAddress} />
          </AppTooltip>
          <Status status={status} />
        </StyledFlexRow>

        <StyledProposalTitle variant="h4">
          {parseLanguage(proposal?.metadata?.title)}
        </StyledProposalTitle>
        <StyledMarkdown
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {removeMd(description || "", {
            useImgAltText: true,
          })}
        </StyledMarkdown>

        {status !== ProposalStatus.CLOSED && proposal?.metadata && (
          <Time proposalMetadata={proposal.metadata} status={status} />
        )}

        {!proposal?.hardcoded &&
          status === ProposalStatus.CLOSED &&
          proposal && <Results proposal={proposal} />}
      </StyledFlexColumn>
    </StyledProposal>
  );
};

const Results = ({ proposal }: { proposal: Proposal }) => {
  const { proposalResult } = proposal;

  const { t } = useTranslation();

  const { totalWeight } = proposalResult;

  if (Number(totalWeight) === 0) {
    return (
      <StyledAlert severity="warning">
        <Typography>{t("endedAndDidntPassedQuorum")}</Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledFlexColumn gap={5}>
      {normalizeResults(proposalResult)
        .filter((it) => it.title !== "totalWeight")
        .map((item) => {
          const { title, percent } = item;

          return (
            <Result
              votingPowerStrategy={proposal.metadata?.votingPowerStrategy}
              key={title}
              title={title}
              percent={percent}
              tonAmount={calculateTonAmount(percent, totalWeight as string)}
            />
          );
        })}
    </StyledFlexColumn>
  );
};

const Result = ({
  title,
  percent = 0,
  tonAmount = "0",
  votingPowerStrategy,
}: {
  title: string;
  percent?: number;
  tonAmount?: string;
  votingPowerStrategy?: VotingPowerStrategy;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <Typography style={{ fontWeight: 700, textTransform: "capitalize" }}>
            {title}
          </Typography>
          <Typography fontSize={13}>
            {tonAmount} {getSymbol(votingPowerStrategy)}
          </Typography>
        </StyledFlexRow>
        <Typography style={{ fontWeight: 700 }}>{percent}%</Typography>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};
