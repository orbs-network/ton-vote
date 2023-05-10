import { VotingPowerStrategy, VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { InputArgs } from "types";

export interface CreateProposalForm {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
  votingPowerStrategies: VotingPowerStrategy[];
  votingChoices: string[];
  description_en?: string;
  description_ru?: string;
  title_en?: string;
  votingSystemType: number;
}

export interface CreateProposalStore {
  formData: CreateProposalForm;
  setFormData: (value: CreateProposalForm) => void;
}

export interface StrategyOption<T> {
  name: string;
  args?: InputArgs<T>[];
}


export type CreateProposalInputArgs  = InputArgs<CreateProposalForm>