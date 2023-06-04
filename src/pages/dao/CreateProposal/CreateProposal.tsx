import { useDaoAddressFromQueryParam } from "hooks";
import { useCreateProposalStore } from "./store";
import _ from "lodash";
import { useAppNavigation } from "router/navigation";
import { useDaoFromQueryParam } from "query/getters";
import { useCreateProposalQuery } from "query/setters";
import { useNewDataStore } from "store";
import { LayoutSection } from "../components";
import { ProposalForm } from "forms/proposal-form/ProposalForm";
import { ProposalForm as ProposalFormType } from "types";
import { prepareMetadata } from "forms/proposal-form/utils";

export const CreateProposal = () => {
  const daoLoading = useDaoFromQueryParam().isLoading;
  const dao = useDaoFromQueryParam();
  const { setFormData, formData } = useCreateProposalStore();
  const appNavigation = useAppNavigation();
  const { mutate: createProposal, isLoading } = useCreateProposalQuery();
    const { addProposal } = useNewDataStore();

  const onSubmit = (formValues: ProposalFormType) => {
    const metadata = prepareMetadata(formValues);

    createProposal({
      metadata,
      onSuccess: (proposalAddress: string) => {
        appNavigation.proposalPage.root(dao.data!.daoAddress, proposalAddress);
        setFormData({} as ProposalFormType);
        addProposal(dao.data!.daoAddress, proposalAddress);
      },
    });
  };

  return (
    <LayoutSection title="Create proposal" isLoading={daoLoading}>
      <ProposalForm
        submitText="Create"
        initialFormData={formData}
        persistForm={setFormData}
        onSubmit={onSubmit}
        isLoading={isLoading}
        dao={dao.data!}
      />
    </LayoutSection>
  );
};

export default CreateProposal;
