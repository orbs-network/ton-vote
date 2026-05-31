import { ProposalMetadata } from "ton-vote-contracts-sdk";
import testProposalMetadata from "./test.json";

type LocalizedText = string | Record<string, string>;
type LocalProposalMetadata = Partial<
  Omit<ProposalMetadata, "title" | "description">
> & {
  title?: LocalizedText;
  description?: LocalizedText;
};

const LOCAL_PROPOSAL_METADATA: Record<string, LocalProposalMetadata> = {
  EQA95DKrJPP7YryEAcMX6PXVlfdm69kVBNuCnFzPN_V0uFzH: testProposalMetadata,
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
