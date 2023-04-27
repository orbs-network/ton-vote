
export interface CreateProposalForm {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
  description: string;
  title: string;
  jetton: string;
  nft: string;
  votingPowerStrategy: number;
  votingChoices: { key: string; value: string }[];
  description_en?: string;
  description_ru?: string;
  title_en?: string;
  votingSystemType: number;
}

export interface CreateProposalStore {
  preview: boolean;
  setPreview: (value: boolean) => void;
  formData: CreateProposalForm;
  setFormData: (value: CreateProposalForm) => void;
}
