import { Box, styled } from "@mui/material";
import { Status, AppTooltip, HiddenProposal } from "components";
import {
  useAppParams,
  useAppQueryParams,
  useProposalStatus,
  useRole,
} from "hooks/hooks";
import _ from "lodash";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Proposal as ProposalType, ProposalStatus } from "types";
import { parseLanguage } from "utils";
import { ProposalLoader } from "../../ProposalLoader";
import removeMd from "remove-markdown";

import {
  StyledAddressDisplay,
  StyledMarkdown,
  StyledProposal,
  StyledProposalTitle,
} from "../styles";
import { useDaoQuery, useProposalQuery } from "query/getters";
import { mock } from "mock/mock";
import { useMemo } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { ProposalTimeline } from "./ProposalTimeline";
import { Results } from "./Results";

const useHideProposal = (proposalAddress: string) => {
  const { query } = useAppQueryParams();

  const { data: proposal } = useProposalQuery(proposalAddress);
  const { data: dao } = useDaoQuery(proposal?.daoAddress || "");

  const { proposalStatus } = useProposalStatus(proposalAddress);
  const title = proposal?.metadata?.title.toLowerCase();
  const description = proposal?.metadata?.description.toLowerCase();

  const { isProposalPublisher, isOwner } = useRole(dao?.daoRoles);

  const filters = useMemo(
    () => [title, description, proposalAddress],
    [title, description, proposalAddress]
  );

  if (query.proposalState && query.proposalState !== proposalStatus) {
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

  if (!proposal?.metadata?.hide) {
    return false;
  }

  if (!isProposalPublisher || !isOwner) {
    return true;
  }

  return false;
};

export const Proposal = ({ proposalAddress }: { proposalAddress: string }) => {
  const { proposalPage } = useAppNavigation();
  const { daoAddress } = useAppParams();
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;

  const proposalQuery = useProposalQuery(proposalAddress, {
    disabled: !isVisible,
  });

  const { data: proposal, isLoading, error } = proposalQuery;

  const { proposalStatus, proposalStatusText } =
    useProposalStatus(proposalAddress);
  const hideProposal = useHideProposal(proposalAddress);

  const description = useMemo(
    () => parseLanguage(proposal?.metadata?.description, "en"),
    [proposal?.metadata?.description]
  );
  const title = useMemo(
    () => parseLanguage(proposal?.metadata?.title),
    [proposal?.metadata?.title]
  );

  const onClick = () => {
    if (daoAddress && proposalAddress) {
      proposalPage.root(daoAddress, proposalAddress);
    }
  };

  if (error || hideProposal) {
    return null;
  }
  return (
    <div onClick={onClick} ref={ref} style={{ width: "100%" }}>
      {isLoading ? (
        <ProposalLoader />
      ) : !proposal ? null : (
        <StyledProposal>
          <StyledFlexColumn alignItems="flex-start" gap={20}>
            <StyledFlexRow justifyContent="space-between">
              <AppTooltip text="Proposal address" placement="right">
                <StyledProposalAddress address={proposalAddress} padding={10} />
              </AppTooltip>
              <StyledFlexRow style={{ width: "auto" }} gap={15}>
                <HiddenProposal proposal={proposal} />
                <Status status={proposalStatusText} />
              </StyledFlexRow>
            </StyledFlexRow>

            <StyledFlexColumn alignItems="flex-start">
              <StyledProposalTitle variant="h4">
                {title}
                {mock.isMockProposal(proposalAddress) && (
                  <small style={{ opacity: 0.5 }}> (Mock)</small>
                )}
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

            {proposalStatus === ProposalStatus.CLOSED && proposal && (
              <Results proposalAddress={proposalAddress} />
            )}
            <ProposalTimeline
              proposalMetadata={proposal?.metadata}
              status={proposalStatus}
            />
          </StyledFlexColumn>
        </StyledProposal>
      )}
    </div>
  );
};

const StyledProposalAddress = styled(StyledAddressDisplay)({
  opacity: 0.7,
  p: {
    fontSize: 14,
  },
});
