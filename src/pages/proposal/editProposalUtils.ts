import { ProposalMetadata } from "ton-vote-contracts-sdk";
import { ProposalForm } from "types";

const parseLocalizedValue = (value?: string) => {
  if (!value) return "";

  try {
    return JSON.parse(value).en || "";
  } catch (error) {
    return value;
  }
};

export const parseProposalMetadataForm = (
  metadata?: ProposalMetadata
): ProposalForm => {
  if (!metadata) {
    return {} as ProposalForm;
  }

  return {
    title_en: parseLocalizedValue(metadata.title),
    description_en: parseLocalizedValue(metadata.description),
    proposalStartTime: metadata.proposalStartTime * 1000,
    proposalEndTime: metadata.proposalEndTime * 1000,
    proposalSnapshotTime: metadata.proposalSnapshotTime * 1000,
    votingSystemType: metadata.votingSystem.votingSystemType,
    votingChoices: metadata.votingSystem.choices,
    votingPowerStrategies: metadata.votingPowerStrategies,
    hide: metadata.hide,
  };
};
