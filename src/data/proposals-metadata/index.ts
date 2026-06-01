import { ProposalMetadata } from "ton-vote-contracts-sdk";
import telegramProposalMetadata from "./telegram-proposal.json";
import { TELEGRAM_DAO } from "consts";

type LocalizedText = string | Record<string, string>;
type LocalProposalMetadata = Partial<
  Omit<ProposalMetadata, "title" | "description">
> & {
  title?: LocalizedText;
  description?: LocalizedText;
};

const LOCAL_PROPOSAL_METADATA: Record<string, LocalProposalMetadata> = {
  "EQDmtv2YqG2uzO76OcPbEfIG_npBbKYMve5lRThkG6Ct33iY": telegramProposalMetadata,
};

const toMetadataText = (value?: LocalizedText) => {
  if (!value || typeof value === "string") return value;

  return JSON.stringify(value);
};

const normalizeLocalMetadata = (
  metadata: LocalProposalMetadata
): Partial<ProposalMetadata> => {
  return {
    ...metadata,
    title: toMetadataText(metadata.title),
    description: toMetadataText(metadata.description),
  };
};

export const getLocalProposalMetadata = (
  proposalAddress: string
): Partial<ProposalMetadata> | undefined => {
  const metadata = LOCAL_PROPOSAL_METADATA[proposalAddress];

  return metadata ? normalizeLocalMetadata(metadata) : undefined;
};

export const applyLocalProposalMetadata = (
  proposalAddress: string,
  metadata?: ProposalMetadata
) => {
  const localMetadata = getLocalProposalMetadata(proposalAddress);

  if (!localMetadata) return metadata;

  return {
    ...metadata,
    ...localMetadata,
  } as ProposalMetadata;
};
