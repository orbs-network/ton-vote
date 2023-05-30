import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { ProposalMetadata } from "ton-vote-contracts-sdk";
import { ProposalStatus } from "types";
import { getTimeDiff } from "utils";
import { StyledTime } from "../styles";

export const ProposalTimeline = ({
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
