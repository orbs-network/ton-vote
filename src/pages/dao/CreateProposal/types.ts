import { InputArgs } from "types";

export interface CreateProposalForm {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
  votingPowerStrategy: number;
  votingChoices: { key: string; value: string }[];
  description_en?: string;
  description_ru?: string;
  title_en?: string;
  votingSystemType: number;
  strategy?: string;
}

export interface CreateProposalStore {
  preview: boolean;
  setPreview: (value: boolean) => void;
  formData: CreateProposalForm;
  setFormData: (value: CreateProposalForm) => void;
}

export interface StrategyOption {
  name: string;
  args?: InputArgs[];
}
export type StrategyValue = { type: string; data: { [key: string]: string } };
