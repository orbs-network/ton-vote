import { styled } from "@mui/material";
import { Status, AppTooltip } from "components";
import {
  useAppQueryParams,
  useDaoAddressFromQueryParam,
  useProposalStatus,
} from "hooks";
import _ from "lodash";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Proposal, ProposalStatus } from "types";
import { parseLanguage } from "utils";
import { ProposalLoader } from "../../ProposalLoader";
import removeMd from "remove-markdown";

import {
  StyledAddressDisplay,
  StyledMarkdown,
  StyledProposal,
  StyledProposalTitle,
} from "../styles";
import { useProposalQuery } from "query/getters";
import { mock } from "mock/mock";
import { useMemo } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { ProposalTimeline } from "./ProposalTimeline";
import { Results } from "./Results";

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

  const proposalQuery = useProposalQuery(proposalAddress, {
    disabled: !isVisible,
  });

  const { data: proposal, isLoading } = proposalQuery;

  const { proposalStatus, proposalStatusText } = useProposalStatus(
    proposalAddress,
    proposal?.metadata
  );
  const hideProposal = useHideProposal(
    proposalAddress,
    proposal,
    proposalStatus
  );

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
    if (daoAddress && proposalAddress) {
      proposalPage.root(daoAddress, proposalAddress);
    }
  };

  return (
    <div onClick={onClick} ref={ref} style={{ width: "100%" }}>
      {isLoading ? (
        <ProposalLoader />
      ) : hideProposal || !proposal ? null : (
        <StyledProposal>
          <StyledFlexColumn alignItems="flex-start" gap={20}>
            <StyledFlexRow justifyContent="space-between">
              <AppTooltip text="Proposal address" placement="right">
                <StyledProposalAddress address={proposalAddress} padding={10} />
              </AppTooltip>
              <Status status={proposalStatusText} />
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

            {proposalStatus === ProposalStatus.CLOSED && proposal && (
              <Results proposalQuery={proposalQuery} />
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
