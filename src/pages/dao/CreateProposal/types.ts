import { ProposalForm } from "types";
export interface CreateProposalStore {
  formData: ProposalForm;
  setFormData: (value: ProposalForm) => void;
}
