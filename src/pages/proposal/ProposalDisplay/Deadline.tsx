import { Countdown, LoadingContainer, TitleContainer } from "components";
import { useAppParams, useProposalStatus } from "hooks/hooks";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import moment from "moment";
import { useProposalQuery } from "query/getters";
import { useMemo } from "react";
import { ProposalStatus } from "types";
import { useShowComponents } from "./hooks";

const handleDate = (endDate?: number) => {
  if (!endDate) return 0;

  return moment.unix(endDate).valueOf();
};

export function Deadline() {
  const {proposalAddress} = useAppParams()
  const { data } = useProposalQuery(proposalAddress);

  const { proposalStatus } = useProposalStatus(proposalAddress);
  const translations = useProposalPageTranslations();

  const proposalMetadata = data?.metadata;
  const show = useShowComponents().deadline

  const title = useMemo(() => {
    if (!proposalStatus) {
      return "";
    }
    if (proposalStatus === ProposalStatus.NOT_STARTED) {
      return translations.voteStartsIn;
    }
    return translations.timeLeftToVote;
  }, [proposalStatus]);

  if (!proposalMetadata) {
    return <LoadingContainer />;
  }

  if (!show) return null
    return (
      <TitleContainer title={title}>
        {proposalStatus === ProposalStatus.NOT_STARTED ? (
          <Countdown date={handleDate(proposalMetadata?.proposalStartTime)} />
        ) : proposalStatus === ProposalStatus.ACTIVE ? (
          <Countdown date={handleDate(proposalMetadata?.proposalEndTime)} />
        ) : null}
      </TitleContainer>
    );
}
