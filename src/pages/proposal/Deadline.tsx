import { Countdown, LoadingContainer, TitleContainer } from "components";
import moment from "moment";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ProposalStatus } from "types";
import { useProposalPageStatus } from "./hooks";
import { useProposalPageQuery } from "./query";

const handleDate = (endDate?: number) => {
  if (!endDate) return 0;

  return moment.unix(endDate).utc().valueOf();
};

export function Deadline() {
  const { data } = useProposalPageQuery();
  const proposalStatus = useProposalPageStatus();
  const {t} = useTranslation()

  const proposalMetadata = data?.metadata;

  if (!proposalMetadata) {
    return <LoadingContainer />;
  }

  const title = useMemo(() => {
    if (!proposalStatus) {
      return "";
    }
    if (proposalStatus === ProposalStatus.NOT_STARTED) {
      return t("voteStartsIn");
    }
    return t("timeLeftToVote");
  }, [proposalStatus]);

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
