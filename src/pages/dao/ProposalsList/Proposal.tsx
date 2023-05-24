import { styled, Typography } from "@mui/material";
import { Status, AppTooltip } from "components";
import { useAppQueryParams, useDaoAddressFromQueryParam } from "hooks";
import _ from "lodash";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import {
  ProposalMetadata,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { Proposal, ProposalStatus } from "types";
import {
  getTimeDiff,
  calculateTonAmount,
  normalizeResults,
  getSymbol,
  parseLanguage,
  getTonAmounFromSumCoins,
  getVoteStrategyType,
} from "utils";
import { ProposalLoader } from "../ProposalLoader";
import removeMd from "remove-markdown";

import {
  StyledAddressDisplay,
  StyledAlert,
  StyledMarkdown,
  StyledProposal,
  StyledProposalPercent,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
  StyledProposalTitle,
  StyledResultName,
  StyledTime,
  StyledTonAmount,
} from "./styles";
import { useTranslation } from "react-i18next";
import BigNumber from "bignumber.js";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useProposalQuery, useProposalStatusQuery } from "query/getters";
import { mock } from "mock/mock";
import { useMemo } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";

const Time = ({
  proposalMetadata,
  status,
}: {
  proposalMetadata?: ProposalMetadata;
  status: ProposalStatus | null;
}) => {
  const translations = useDaoPageTranslations();
  if (!status || !proposalMetadata) return null;

  if (status === ProposalStatus.NOT_STARTED) {
    return (
      <StyledTime>
        {translations.startIn(getTimeDiff(proposalMetadata.proposalStartTime))}
      </StyledTime>
    );
  }

  if (status === ProposalStatus.CLOSED) {
    return (
      <StyledTime>
        {translations.proposalEnded(
          getTimeDiff(proposalMetadata.proposalEndTime, true)
        )}
      </StyledTime>
    );
  }

  return (
    <StyledTime>
      {translations.endIn(getTimeDiff(proposalMetadata.proposalEndTime))}
    </StyledTime>
  );
};

const useHideProposal = (
  proposalAddress: string,
  proposal?: Proposal | null,
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
  const daoAddress = useDaoAddressFromQueryParam();
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  
  const { data: proposal, isLoading } = useProposalQuery(proposalAddress, {
    disabled: !isVisible,
  });

  const status = useProposalStatusQuery(proposal?.metadata, proposalAddress);
  const hideProposal = useHideProposal(proposalAddress, proposal, status);

  const isMock = useMemo(
    () => mock.isMockProposal(proposalAddress),
    [proposalAddress]
  );

  const description = useMemo(
    () => parseLanguage(proposal?.metadata?.description, "en"),
    [proposal?.metadata?.description]
  );
  const title = useMemo(
    () => parseLanguage(proposal?.metadata?.title),
    [proposal?.metadata?.title]
  );

  const onClick = () => {
    if (daoAddress && proposalAddress){
      proposalPage.root(daoAddress, proposalAddress);
    }
      
  };


  return (
    <StyledProposal onClick={onClick} ref={ref}>
      {isLoading ? (
        <ProposalLoader />
      ) : hideProposal || !proposal ? null : (
        <StyledFlexColumn alignItems="flex-start" gap={20}>
          <StyledFlexRow justifyContent="space-between">
            <AppTooltip text="Proposal address" placement="right">
              <StyledProposalAddress address={proposalAddress} padding={10} />
            </AppTooltip>
            <Status status={status} />
          </StyledFlexRow>

          <StyledFlexColumn alignItems="flex-start">
            <StyledProposalTitle variant="h4">
              {title}
              {isMock && <small style={{ opacity: 0.5 }}> (Mock)</small>}
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
      )}
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
  const totalWeight = proposalResult.totalWeight;
  const translations = useDaoPageTranslations();

  if (Number(totalWeight) === 0) {
    return (
      <StyledAlert severity="warning">
        <Typography>{translations.endedAndDidntPassedQuorum}</Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledResults gap={10}>
      {normalizeResults(proposalResult).map((item) => {
        const { title, percent } = item;
        return (
          <Result
            votingPowerStrategy={getVoteStrategyType(
              proposal.metadata?.votingPowerStrategies
            )}
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
  votingPowerStrategy?: VotingPowerStrategyType;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <StyledResultName text={title} />
          <StyledTonAmount>
            {tonAmount} {getSymbol(votingPowerStrategy)}
          </StyledTonAmount>
        </StyledFlexRow>
        <StyledProposalPercent>{percent}%</StyledProposalPercent>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};
