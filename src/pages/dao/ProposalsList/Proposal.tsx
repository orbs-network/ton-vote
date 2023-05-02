import { styled, Typography } from "@mui/material";
import { AddressDisplay, Status, AppTooltip, Container } from "components";
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
  getTonAmounFromSumCoins,
} from "utils";
import { ProposalLoader } from "../ProposalLoader";
import removeMd from "remove-markdown";

import {
  StyledAddressDisplay,
  StyledAlert,
  StyledMarkdown,
  StyledProposal,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
  StyledProposalTitle,
  StyledTime,
} from "./styles";
import { useTranslation } from "react-i18next";
import BigNumber from "bignumber.js";

const Time = ({
  proposalMetadata,
  status,
}: {
  proposalMetadata?: ProposalMetadata;
  status: ProposalStatus | null;
}) => {
  const { t } = useTranslation();
  if (!status || !proposalMetadata) return null;

  if (status === ProposalStatus.NOT_STARTED) {
    return (
      <StyledTime>
        {t("startIn", {
          value: getTimeDiff(proposalMetadata.proposalStartTime),
        })}
      </StyledTime>
    );
  }

  if (status === ProposalStatus.CLOSED) {
    return (
      <StyledTime>
        {t("proposalEnded", {
          value: getTimeDiff(proposalMetadata.proposalEndTime, true),
        })}
      </StyledTime>
    );
  }

  return (
    <StyledTime>
      {t("endIn", { value: getTimeDiff(proposalMetadata.proposalEndTime) })}
    </StyledTime>
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
    proposalPage.root(daoAddress, proposalAddress);
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
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <StyledFlexRow justifyContent="space-between">
          <AppTooltip text="Proposal address" placement="right">
            <StyledProposalAddress address={proposalAddress} padding={10} />
          </AppTooltip>
          <Status status={status} />
        </StyledFlexRow>

        <StyledFlexColumn alignItems="flex-start">
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
        </StyledFlexColumn>

        {!proposal?.hardcoded &&
          status === ProposalStatus.CLOSED &&
          proposal && <Results proposal={proposal} />}
        <Time proposalMetadata={proposal?.metadata} status={status} />
      </StyledFlexColumn>
    </StyledProposal>
  );
};

const StyledProposalAddress = styled(StyledAddressDisplay)({
  opacity: 0.7,
  p: {
    fontSize: 14,
  },
});

const Results = ({ proposal }: { proposal: Proposal }) => {
  const { proposalResult, sumCoins } = proposal;

  const { t } = useTranslation();

  const totalWeight = proposalResult.totalWeight;

  

  if (Number(totalWeight) === 0) {
    return (
      <StyledAlert severity="warning">
        <Typography>{t("endedAndDidntPassedQuorum")}</Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledResults gap={5}>
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
              tonAmount={
                sumCoins
                  ? getTonAmounFromSumCoins(sumCoins[title] as BigNumber)
                  : calculateTonAmount(percent, totalWeight as string)
              }
            />
          );
        })}
    </StyledResults>
  );
};




const StyledResults = styled(StyledFlexColumn)({
  width: "100%",
  padding: 10,
  background: "#F8F9FB",
  boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
  borderRadius: 10,
});

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
