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
  formData: CreateProposalForm;
  setFormData: (value: CreateProposalForm) => void;
}

export interface StrategyOption {
  name: string;
  args?: InputArgs[];
}
export type StrategyValue = { type: string[]; args: string[][] };
